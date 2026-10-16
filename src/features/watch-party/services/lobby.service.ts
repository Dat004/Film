import { getDatabase, ref, set, get, query, orderByChild, limitToLast } from 'firebase/database';

import { trackWatchPartyEvent } from '../lib/watch-party.telemetry';
import { buildLobbyFromLegacyRoom } from '../lib/watch-party.utils';
import type {
  WatchPartyRoom,
  WatchPartyLobbyEntry,
  WatchPartyFilmMeta,
} from '../types/watch-party.types';

import type { UserParam } from './types';

export const buildLobbyEntry = (
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

export const ensureLobbyEntry = async (roomId: string): Promise<WatchPartyLobbyEntry> => {
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
