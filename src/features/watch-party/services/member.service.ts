import {
  getDatabase,
  ref,
  get,
  update,
  remove,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database';

import { sha256 } from '../lib/sha256';
import { trackWatchPartyEvent } from '../lib/watch-party.telemetry';
import { pickNextHost } from '../lib/watch-party.utils';
import type { RoomMember } from '../types/watch-party.types';

import { sendSystemMessage } from './chat.service';
import { setLobbyMemberCount } from './lobby.service';

export { sha256 };

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
