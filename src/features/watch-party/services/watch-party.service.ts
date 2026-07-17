import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  push,
  onDisconnect,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
} from 'firebase/database';

import { HOST_OFFLINE_GRACE_MS, ROOM_LIMITS } from '../constants/watch-party.constants';
import { sha256 } from '../lib/sha256';
import { trackWatchPartyEvent } from '../lib/watch-party.telemetry';
import {
  buildLobbyFromLegacyRoom,
  decideStaleRoomAction,
  isLobbyHostOfflinePastGrace,
  pickNextHost,
} from '../lib/watch-party.utils';
import type {
  WatchPartyRoom,
  RoomMember,
  WatchPartyLobbyEntry,
  WatchPartyFilmMeta,
} from '../types/watch-party.types';

export interface UserParam {
  uid: string;
  displayName?: string | null;
  photoURL?: string | null;
}

export { sha256 };

const buildLobbyEntry = (
  roomId: string,
  host: UserParam,
  filmId: string,
  filmMeta: WatchPartyFilmMeta,
  isPrivate: boolean,
  memberCount: number
): WatchPartyLobbyEntry => ({
  roomId,
  hostId: host.uid,
  creatorId: host.uid,
  filmId,
  filmName: filmMeta.name,
  posterUrl: filmMeta.posterUrl,
  ...(filmMeta.categoryName ? { categoryName: filmMeta.categoryName } : {}),
  isPrivate,
  createdAt: Date.now(),
  memberCount,
  hostName: host.displayName || 'Ẩn danh',
  hostPhoto: host.photoURL || '',
  hostConnected: true,
  hostDisconnectedAt: null,
});

export const setLobbyMemberCount = async (roomId: string, memberCount: number): Promise<void> => {
  const db = getDatabase();
  try {
    await set(ref(db, `watch_party_lobby/${roomId}/memberCount`), memberCount);
  } catch (err) {
    trackWatchPartyEvent('lobby_count_sync_skipped', {
      roomId,
      memberCount,
      reason: err instanceof Error ? err.message : 'unknown',
    });
  }
};

const ensureLobbyEntry = async (roomId: string): Promise<WatchPartyLobbyEntry> => {
  const db = getDatabase();
  const lobbySnap = await get(ref(db, `watch_party_lobby/${roomId}`));
  if (lobbySnap.exists()) {
    return lobbySnap.val() as WatchPartyLobbyEntry;
  }

  const roomSnap = await get(ref(db, `watch_party_rooms/${roomId}`));
  if (!roomSnap.exists()) {
    throw new Error('Phòng không tồn tại hoặc đã bị giải tán');
  }

  const room = roomSnap.val() as WatchPartyRoom;
  const legacyLobby = buildLobbyFromLegacyRoom(roomId, room);
  if (!legacyLobby) {
    throw new Error('Phòng không tồn tại hoặc đã bị giải tán');
  }

  await set(ref(db, `watch_party_lobby/${roomId}`), legacyLobby);

  if (room.isPrivate && room.passwordHash) {
    const joinGateRef = ref(db, `watch_party_rooms/${roomId}/joinGate/passwordHash`);
    const joinGateSnap = await get(joinGateRef);
    if (!joinGateSnap.exists()) {
      await set(joinGateRef, room.passwordHash);
    }
  }

  trackWatchPartyEvent('room_join', { roomId, action: 'legacy_lobby_migrated' });
  return legacyLobby;
};

/** Registers presence updates without removing disconnected members. */
export const registerRoomDisconnectHandler = async (
  roomId: string,
  userId: string,
  _members: Record<string, RoomMember>,
  isHost: boolean
): Promise<void> => {
  const db = getDatabase();
  const memberPath = `watch_party_rooms/${roomId}/members/${userId}`;

  try {
    await onDisconnect(ref(db)).cancel();
  } catch {
    // No handler was registered.
  }
  try {
    await onDisconnect(ref(db, memberPath)).cancel();
  } catch {
    // No handler was registered.
  }

  const onlineUpdates: Record<string, unknown> = {
    [`${memberPath}/connected`]: true,
    [`${memberPath}/disconnectedAt`]: null,
  };
  if (isHost) {
    onlineUpdates[`watch_party_lobby/${roomId}/hostConnected`] = true;
    onlineUpdates[`watch_party_lobby/${roomId}/hostDisconnectedAt`] = null;
  }
  await update(ref(db), onlineUpdates);

  const offlineUpdates: Record<string, unknown> = {
    [`${memberPath}/connected`]: false,
    [`${memberPath}/disconnectedAt`]: serverTimestamp(),
  };
  if (isHost) {
    offlineUpdates[`watch_party_lobby/${roomId}/hostConnected`] = false;
    offlineUpdates[`watch_party_lobby/${roomId}/hostDisconnectedAt`] = serverTimestamp();
  }
  await onDisconnect(ref(db)).update(offlineUpdates);
};

export const cancelRoomDisconnectHandler = async (
  roomId?: string,
  userId?: string
): Promise<void> => {
  const db = getDatabase();
  try {
    if (roomId && userId) {
      await onDisconnect(ref(db, `watch_party_rooms/${roomId}/members/${userId}`)).cancel();
    }
  } catch {
    // No handler registered
  }
  try {
    await onDisconnect(ref(db)).cancel();
  } catch {
    // No root handler was registered.
  }
};

/** Assigns a host when the current host is no longer a room member. */
export const repairOrphanHost = async (
  roomId: string,
  members: Record<string, RoomMember>,
  hostId: string
): Promise<void> => {
  // A disconnected host remains eligible during the grace period.
  if (members[hostId]) return;

  const nextHost = pickNextHost(Object.values(members));
  if (!nextHost) return;

  await transferHost(roomId, nextHost.uid);
};

/** Transfers or removes a room after the host grace period expires. */
export const reconcileStaleWatchPartyRoom = async (
  roomId: string,
  graceMs = HOST_OFFLINE_GRACE_MS
): Promise<'noop' | 'transferred' | 'destroyed'> => {
  const db = getDatabase();
  const roomSnap = await get(ref(db, `watch_party_rooms/${roomId}`));

  if (!roomSnap.exists()) {
    const lobbySnap = await get(ref(db, `watch_party_lobby/${roomId}`));
    if (lobbySnap.exists()) {
      try {
        await remove(ref(db, `watch_party_lobby/${roomId}`));
        trackWatchPartyEvent('room_stale_cleanup', { roomId, action: 'orphan_lobby' });
        return 'destroyed';
      } catch {
        return 'noop';
      }
    }
    return 'noop';
  }

  const room = roomSnap.val() as WatchPartyRoom;
  const decision = decideStaleRoomAction(room, Date.now(), graceMs);

  if (decision.action === 'noop') return 'noop';

  if (decision.action === 'destroy') {
    try {
      await update(ref(db), {
        [`watch_party_rooms/${roomId}`]: null,
        [`watch_party_lobby/${roomId}`]: null,
      });
      trackWatchPartyEvent('room_stale_cleanup', { roomId, action: 'destroyed' });
      return 'destroyed';
    } catch (err) {
      trackWatchPartyEvent('room_stale_cleanup', {
        roomId,
        action: 'destroy_failed',
        reason: err instanceof Error ? err.message : 'unknown',
      });
      return 'noop';
    }
  }

  if (decision.action === 'transfer' && decision.nextHostId) {
    try {
      await transferHost(roomId, decision.nextHostId);
      trackWatchPartyEvent('room_stale_cleanup', {
        roomId,
        action: 'transferred',
        nextHostId: decision.nextHostId,
      });
      return 'transferred';
    } catch (err) {
      trackWatchPartyEvent('room_stale_cleanup', {
        roomId,
        action: 'transfer_failed',
        reason: err instanceof Error ? err.message : 'unknown',
      });
      return 'noop';
    }
  }

  return 'noop';
};

/** Reconciles stale rooms found in a lobby snapshot. */
export const reconcileStaleLobbyRooms = async (
  entries: WatchPartyLobbyEntry[],
  graceMs = HOST_OFFLINE_GRACE_MS
): Promise<void> => {
  const stale = entries.filter((e) => isLobbyHostOfflinePastGrace(e, Date.now(), graceMs));
  if (stale.length === 0) return;

  await Promise.allSettled(
    stale.map((entry) => reconcileStaleWatchPartyRoom(entry.roomId, graceMs))
  );
};

export const createRoom = async (
  host: UserParam,
  filmId: string,
  filmMeta: WatchPartyFilmMeta,
  password: string | null = null
): Promise<string> => {
  const db = getDatabase();
  const roomId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const passwordHash = password ? await sha256(password) : null;
  const isPrivate = !!password;

  const initData: WatchPartyRoom & { joinGate?: { passwordHash: string } } = {
    roomId,
    hostId: host.uid,
    creatorId: host.uid,
    filmId,
    isPrivate,
    passwordHash: null,
    status: {
      isPlaying: false,
      currentTime: 0,
      currentEpisode: 0,
      playbackRate: 1,
      autoPlay: true,
      autoNext: true,
      seekSeq: 0,
    },
    members: {
      [host.uid]: {
        uid: host.uid,
        displayName: host.displayName || 'Anonymous',
        photoURL: host.photoURL || '',
        joinedAt: Date.now(),
        connected: true,
        disconnectedAt: null,
      },
    },
    createdAt: Date.now(),
    ...(passwordHash ? { joinGate: { passwordHash } } : {}),
  };

  const lobbyEntry = buildLobbyEntry(roomId, host, filmId, filmMeta, isPrivate, 1);

  await update(ref(db), {
    [`watch_party_rooms/${roomId}`]: initData,
    [`watch_party_lobby/${roomId}`]: lobbyEntry,
  });
  trackWatchPartyEvent('room_create', { roomId, filmId, isPrivate });
  return roomId;
};

export const joinRoom = async (
  roomId: string,
  user: UserParam,
  password: string | null = null
): Promise<void> => {
  const db = getDatabase();

  let lobby: WatchPartyLobbyEntry;
  try {
    lobby = await ensureLobbyEntry(roomId);
  } catch (err) {
    trackWatchPartyEvent('room_join_failed', {
      roomId,
      reason: err instanceof Error ? err.message : 'unknown',
    });
    throw err;
  }

  // Resolve stale ownership before adding another member.
  if (isLobbyHostOfflinePastGrace(lobby)) {
    const result = await reconcileStaleWatchPartyRoom(roomId);
    if (result === 'destroyed') {
      throw new Error('Phòng không tồn tại hoặc đã bị giải tán');
    }
  }

  const roomSnap = await get(ref(db, `watch_party_rooms/${roomId}/members/${user.uid}`));
  const isAlreadyMember = roomSnap.exists();

  if (lobby.isPrivate) {
    const isCreator = lobby.creatorId === user.uid;
    const isCurrentHost = lobby.hostId === user.uid;
    // Existing members can reconnect without entering the password again.
    const skipPassword = isAlreadyMember || isCreator || isCurrentHost;

    if (!skipPassword) {
      if (!password) {
        throw new Error('PASSWORD_REQUIRED');
      }
      const hashSnap = await get(ref(db, `watch_party_rooms/${roomId}/joinGate/passwordHash`));
      const inputHash = await sha256(password);
      if (!hashSnap.exists() || inputHash !== hashSnap.val()) {
        trackWatchPartyEvent('room_join_failed', { roomId, reason: 'PASSWORD_INCORRECT' });
        throw new Error('PASSWORD_INCORRECT');
      }
    }
  }

  if (!isAlreadyMember && lobby.memberCount >= ROOM_LIMITS.maxMembers) {
    trackWatchPartyEvent('room_join_failed', { roomId, reason: 'ROOM_FULL' });
    throw new Error(`Phòng đã đầy (tối đa ${ROOM_LIMITS.maxMembers} người)`);
  }

  const memberRef = ref(db, `watch_party_rooms/${roomId}/members/${user.uid}`);
  const memberData: RoomMember = {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    photoURL: user.photoURL || '',
    joinedAt: isAlreadyMember
      ? ((roomSnap.val() as RoomMember)?.joinedAt ?? Date.now())
      : Date.now(),
    connected: true,
    disconnectedAt: null,
  };

  await set(memberRef, memberData);

  if (!isAlreadyMember) {
    await setLobbyMemberCount(roomId, lobby.memberCount + 1);
    await sendSystemMessage(roomId, `${user.displayName || 'Ẩn danh'} đã tham gia phòng`);
  }

  // The creator may reclaim an unoccupied host role.
  const fullRoomSnap = await get(ref(db, `watch_party_rooms/${roomId}`));
  if (fullRoomSnap.exists()) {
    const room = fullRoomSnap.val() as WatchPartyRoom;
    const creatorId = room.creatorId || lobby.creatorId;
    if (creatorId === user.uid && room.hostId !== user.uid) {
      const currentHost = room.members?.[room.hostId];
      const hostGone = !currentHost;
      const hostOffline = currentHost?.connected === false;
      if (hostGone || hostOffline) {
        await transferHost(roomId, user.uid);
      }
    }
  }

  trackWatchPartyEvent('room_join', { roomId, uid: user.uid, rejoin: isAlreadyMember });
};

/** Updates playback state published by the host. */
export const updateVideoSync = async (
  roomId: string,
  payload: {
    isPlaying: boolean;
    currentTime: number;
    currentEpisode?: number;
    playbackRate?: number;
    autoPlay?: boolean;
    autoNext?: boolean;
    seekSeq?: number;
  }
): Promise<void> => {
  const db = getDatabase();
  const statusRef = ref(db, `watch_party_rooms/${roomId}/status`);
  try {
    await update(statusRef, {
      isPlaying: payload.isPlaying,
      currentTime: payload.currentTime,
      currentEpisode: payload.currentEpisode ?? 0,
      ...(typeof payload.playbackRate === 'number' ? { playbackRate: payload.playbackRate } : {}),
      ...(typeof payload.autoPlay === 'boolean' ? { autoPlay: payload.autoPlay } : {}),
      ...(typeof payload.autoNext === 'boolean' ? { autoNext: payload.autoNext } : {}),
      ...(typeof payload.seekSeq === 'number' ? { seekSeq: payload.seekSeq } : {}),
      updatedAt: Date.now(),
    });
  } catch (err) {
    trackWatchPartyEvent('status_sync_skipped', {
      roomId,
      reason: err instanceof Error ? err.message : 'unknown',
    });
  }
};

export const sendMessage = async (roomId: string, user: UserParam, text: string): Promise<void> => {
  const trimmed = text.trim();
  if (!trimmed) return;

  const db = getDatabase();
  const messagesRef = ref(db, `watch_party_rooms/${roomId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    text: trimmed.slice(0, 500),
    timestamp: Date.now(),
  });
};

export const sendReaction = async (
  roomId: string,
  user: UserParam,
  emoji: string
): Promise<void> => {
  const db = getDatabase();
  const reactionsRef = ref(db, `watch_party_rooms/${roomId}/reactions`);
  const newReactionRef = push(reactionsRef);
  await set(newReactionRef, {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    emoji,
    timestamp: Date.now(),
  });

  setTimeout(async () => {
    try {
      await remove(newReactionRef);
    } catch {
      // The room may have been removed before this timer fired.
    }
  }, ROOM_LIMITS.reactionTimeout);
};

/** Writes a member-authorized system message. */
export const sendSystemMessage = async (roomId: string, text: string): Promise<void> => {
  const db = getDatabase();
  const messagesRef = ref(db, `watch_party_rooms/${roomId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    uid: 'system',
    displayName: 'Hệ thống',
    text,
    type: 'system',
    timestamp: Date.now(),
  });
};

export const kickMember = async (roomId: string, targetUserId: string): Promise<void> => {
  const db = getDatabase();
  const snapshot = await get(ref(db, `watch_party_rooms/${roomId}/members/${targetUserId}`));
  let targetName = 'Ẩn danh';
  if (snapshot.exists()) {
    targetName = (snapshot.val() as RoomMember).displayName || 'Ẩn danh';
  }

  await remove(ref(db, `watch_party_rooms/${roomId}/members/${targetUserId}`));
  await sendSystemMessage(roomId, `${targetName} đã bị mời ra khỏi phòng`);

  const membersSnap = await get(ref(db, `watch_party_rooms/${roomId}/members`));
  const count = membersSnap.exists() ? Object.keys(membersSnap.val() as object).length : 0;
  await setLobbyMemberCount(roomId, count);
  trackWatchPartyEvent('member_kick', { roomId, targetUserId });
};

export const transferHost = async (roomId: string, newHostId: string): Promise<void> => {
  const db = getDatabase();
  const snapshot = await get(ref(db, `watch_party_rooms/${roomId}/members/${newHostId}`));
  let newHostName = 'Ẩn danh';
  let newHostPhoto = '';
  let newHostConnected = true;
  if (snapshot.exists()) {
    const member = snapshot.val() as RoomMember;
    newHostName = member.displayName || 'Ẩn danh';
    newHostPhoto = member.photoURL || '';
    newHostConnected = member.connected !== false;
  }

  await update(ref(db), {
    [`watch_party_rooms/${roomId}/hostId`]: newHostId,
    [`watch_party_lobby/${roomId}/hostId`]: newHostId,
    [`watch_party_lobby/${roomId}/hostName`]: newHostName,
    [`watch_party_lobby/${roomId}/hostPhoto`]: newHostPhoto,
    [`watch_party_lobby/${roomId}/hostConnected`]: newHostConnected,
    [`watch_party_lobby/${roomId}/hostDisconnectedAt`]: newHostConnected ? null : serverTimestamp(),
  });

  await sendSystemMessage(roomId, `${newHostName} đã trở thành Chủ phòng mới`);
  trackWatchPartyEvent('host_transfer', { roomId, newHostId });
};

export const destroyRoom = async (roomId: string): Promise<void> => {
  const db = getDatabase();
  await cancelRoomDisconnectHandler();
  await update(ref(db), {
    [`watch_party_rooms/${roomId}`]: null,
    [`watch_party_lobby/${roomId}`]: null,
  });
  trackWatchPartyEvent('room_destroy', { roomId });
};

export const leaveRoom = async (
  roomId: string,
  userId: string,
  isHost: boolean,
  members: Record<string, RoomMember> | null
): Promise<void> => {
  const db = getDatabase();

  const roomSnap = await get(ref(db, `watch_party_rooms/${roomId}`));
  if (!roomSnap.exists()) {
    return;
  }

  const room = roomSnap.val() as WatchPartyRoom;
  // Prefer the server snapshot over possibly stale local membership.
  const liveMembers = room.members || members || {};
  const actuallyHost = room.hostId === userId || isHost;

  await cancelRoomDisconnectHandler(roomId, userId);

  const member = liveMembers[userId] || { displayName: 'Ẩn danh' };
  const remaining = Object.values(liveMembers).filter((m) => m.uid !== userId);
  const nextCount = remaining.length;

  // Remove both room records atomically when the last member leaves.
  if (nextCount === 0) {
    await update(ref(db), {
      [`watch_party_rooms/${roomId}`]: null,
      [`watch_party_lobby/${roomId}`]: null,
    });
    trackWatchPartyEvent('room_leave', { roomId, userId, destroyed: true });
    return;
  }

  // Rules require membership while writing a system message.
  try {
    await sendSystemMessage(roomId, `${member.displayName || 'Ẩn danh'} đã rời phòng`);
  } catch {
    // Chat failure must not block leaving the room.
  }

  const updates: Record<string, unknown> = {
    [`watch_party_rooms/${roomId}/members/${userId}`]: null,
    [`watch_party_lobby/${roomId}/memberCount`]: nextCount,
  };

  let nextHost: RoomMember | null = null;
  if (actuallyHost) {
    nextHost = pickNextHost(remaining);
    if (nextHost) {
      const nextConnected = nextHost.connected !== false;
      updates[`watch_party_rooms/${roomId}/hostId`] = nextHost.uid;
      updates[`watch_party_lobby/${roomId}/hostId`] = nextHost.uid;
      updates[`watch_party_lobby/${roomId}/hostName`] = nextHost.displayName || 'Ẩn danh';
      updates[`watch_party_lobby/${roomId}/hostPhoto`] = nextHost.photoURL || '';
      updates[`watch_party_lobby/${roomId}/hostConnected`] = nextConnected;
      updates[`watch_party_lobby/${roomId}/hostDisconnectedAt`] = nextConnected
        ? null
        : (nextHost.disconnectedAt ?? Date.now());
    }
  }

  await update(ref(db), updates);

  if (nextHost) {
    try {
      await sendSystemMessage(
        roomId,
        `${nextHost.displayName || 'Ẩn danh'} đã trở thành Chủ phòng mới`
      );
    } catch {
      // Host transfer is already complete.
    }
  }

  trackWatchPartyEvent('room_leave', { roomId, userId });
};

export const getPublicRooms = async (): Promise<WatchPartyLobbyEntry[]> => {
  const db = getDatabase();
  const lobbyRef = ref(db, 'watch_party_lobby');
  const q = query(lobbyRef, orderByChild('createdAt'), limitToLast(20));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];

  const rooms: WatchPartyLobbyEntry[] = [];
  snapshot.forEach((childSnap) => {
    const entry = childSnap.val() as WatchPartyLobbyEntry;
    if (!entry.isPrivate) {
      rooms.push({
        ...entry,
        roomId: entry.roomId || childSnap.key || '',
      });
    }
  });
  return rooms.reverse();
};
