import { getDatabase, ref, set, get, update, remove } from 'firebase/database';

import { HOST_OFFLINE_GRACE_MS, ROOM_LIMITS } from '../constants/watch-party.constants';
import { sha256 } from '../lib/sha256';
import { trackWatchPartyEvent } from '../lib/watch-party.telemetry';
import {
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

import { sendSystemMessage } from './chat.service';
import { buildLobbyEntry, ensureLobbyEntry, setLobbyMemberCount } from './lobby.service';
import { cancelRoomDisconnectHandler, transferHost } from './member.service';
import type { UserParam } from './types';

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
