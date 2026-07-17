import { HOST_OFFLINE_GRACE_MS } from '../constants/watch-party.constants';
import type {
  RoomMember,
  RoomMessage,
  WatchPartyLobbyEntry,
  WatchPartyRoom,
} from '../types/watch-party.types';

/** Converts supported Firebase timestamp shapes to epoch milliseconds. */
export function toEpochMs(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (value && typeof value === 'object' && 'seconds' in (value as object)) {
    const seconds = (value as { seconds?: number }).seconds;
    if (typeof seconds === 'number') return seconds * 1000;
  }
  return null;
}

export type StaleRoomAction = 'noop' | 'transfer' | 'destroy';

/** Determines whether a stale room should be kept, transferred, or removed. */
export function decideStaleRoomAction(
  room: Pick<WatchPartyRoom, 'hostId' | 'members'>,
  now = Date.now(),
  graceMs = HOST_OFFLINE_GRACE_MS
): { action: StaleRoomAction; nextHostId?: string } {
  const members = room.members ? Object.values(room.members) : [];
  if (members.length === 0) return { action: 'destroy' };

  const host = room.members?.[room.hostId];
  const hostOffline = !host || host.connected === false;
  if (!hostOffline) return { action: 'noop' };

  const disconnectedAt = toEpochMs(host?.disconnectedAt);
  // Wait for the server timestamp written by onDisconnect.
  if (host && disconnectedAt == null) return { action: 'noop' };

  const offlineFor = disconnectedAt != null ? now - disconnectedAt : Number.POSITIVE_INFINITY;
  if (offlineFor < graceMs) return { action: 'noop' };

  const connected = members.filter((m) => m.connected !== false && m.uid !== room.hostId);
  if (connected.length === 0) {
    // Remove rooms with no connected members.
    return { action: 'destroy' };
  }

  const next = pickNextHost(members, room.hostId);
  if (!next || next.uid === room.hostId) return { action: 'noop' };
  return { action: 'transfer', nextHostId: next.uid };
}

/** Checks whether a lobby entry has exceeded the host grace period. */
export function isLobbyHostOfflinePastGrace(
  entry: Pick<WatchPartyLobbyEntry, 'hostConnected' | 'hostDisconnectedAt'>,
  now = Date.now(),
  graceMs = HOST_OFFLINE_GRACE_MS
): boolean {
  if (entry.hostConnected !== false) return false;
  const at = toEpochMs(entry.hostDisconnectedAt);
  if (at == null) return false;
  return now - at >= graceMs;
}

/** Sorts chat messages and attaches their RTDB keys. */
export function sortRoomMessages(
  messages: Record<string, RoomMessage> | null | undefined,
  limit = 100
): RoomMessage[] {
  if (!messages) return [];

  return Object.entries(messages)
    .map(([id, msg]) => ({ ...msg, id }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-limit);
}

/** Removes consecutive duplicate system messages within a time window. */
export function dedupeSystemMessages(messages: RoomMessage[], windowMs = 8_000): RoomMessage[] {
  const result: RoomMessage[] = [];
  for (const msg of messages) {
    const prev = result[result.length - 1];
    if (
      msg.type === 'system' &&
      prev?.type === 'system' &&
      prev.text === msg.text &&
      Math.abs((msg.timestamp || 0) - (prev.timestamp || 0)) <= windowMs
    ) {
      continue;
    }
    result.push(msg);
  }
  return result;
}

/** Selects the earliest connected member, with an offline fallback. */
export function pickNextHost(members: RoomMember[], excludeUid?: string): RoomMember | null {
  const eligible = (excludeUid ? members.filter((m) => m.uid !== excludeUid) : members).filter(
    (m) => m.connected !== false
  );
  const pool =
    eligible.length > 0
      ? eligible
      : excludeUid
        ? members.filter((m) => m.uid !== excludeUid)
        : members;
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => a.joinedAt - b.joinedAt)[0] ?? null;
}

/** Builds a lobby entry for rooms created before the lobby split. */
export function buildLobbyFromLegacyRoom(
  roomId: string,
  room: WatchPartyRoom
): WatchPartyLobbyEntry | null {
  const members = room.members ? Object.values(room.members) : [];
  const host = members.find((m) => m.uid === room.hostId) ?? members[0];
  const filmData = room.filmData as Record<string, unknown> | undefined;
  const movie = filmData?.['movie'] as Record<string, unknown> | undefined;
  const categories = movie?.['category'] as Array<{ name?: string }> | undefined;

  const filmId = room.filmId || (movie?.['slug'] as string) || '';
  if (!filmId) return null;

  const hostConnected = host?.connected !== false;

  return {
    roomId,
    hostId: room.hostId,
    creatorId: room.creatorId || room.hostId,
    filmId,
    filmName: (movie?.['name'] as string) || 'Phim',
    posterUrl: (movie?.['poster_url'] as string) || '',
    ...(categories?.[0]?.name ? { categoryName: categories[0].name } : {}),
    isPrivate: Boolean(room.isPrivate),
    createdAt: room.createdAt || Date.now(),
    memberCount: members.length,
    hostName: host?.displayName || 'Ẩn danh',
    hostPhoto: host?.photoURL || '',
    hostConnected,
    hostDisconnectedAt: hostConnected ? null : toEpochMs(host?.disconnectedAt),
  };
}
