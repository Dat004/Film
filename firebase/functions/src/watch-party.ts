import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

/** Must match HOST_OFFLINE_GRACE_MS in the client. */
const HOST_OFFLINE_GRACE_MS = 15 * 60 * 1000;

interface RoomMember {
  uid: string;
  displayName?: string;
  photoURL?: string;
  joinedAt: number;
  connected?: boolean;
  disconnectedAt?: number | null;
}

interface WatchPartyRoom {
  hostId: string;
  createdAt?: number;
  members?: Record<string, RoomMember>;
}

interface LobbyEntry {
  hostConnected?: boolean;
  hostDisconnectedAt?: number | null;
  hostId?: string;
}

const getDb = () => admin.database();

export async function pushSystemMessage(roomId: string, text: string): Promise<void> {
  const messagesRef = getDb().ref(`watch_party_rooms/${roomId}/messages`).push();
  await messagesRef.set({
    uid: 'system',
    displayName: 'Hệ thống',
    text,
    type: 'system',
    timestamp: Date.now(),
  });
}

export function pickNextHost(members: RoomMember[], excludeUid?: string): RoomMember | null {
  const pool = (excludeUid ? members.filter((m) => m.uid !== excludeUid) : members).filter(
    (m) => m.connected !== false
  );
  const fallback =
    pool.length > 0 ? pool : excludeUid ? members.filter((m) => m.uid !== excludeUid) : members;
  if (fallback.length === 0) return null;
  return [...fallback].sort((a, b) => a.joinedAt - b.joinedAt)[0] ?? null;
}

async function syncLobbyMemberCount(roomId: string, count: number): Promise<void> {
  await getDb().ref(`watch_party_lobby/${roomId}/memberCount`).set(count);
}

async function transferHost(roomId: string, nextHost: RoomMember): Promise<void> {
  const connected = nextHost.connected !== false;
  await getDb().ref(`watch_party_rooms/${roomId}/hostId`).set(nextHost.uid);
  await getDb()
    .ref(`watch_party_lobby/${roomId}`)
    .update({
      hostId: nextHost.uid,
      hostName: nextHost.displayName || 'Ẩn danh',
      hostPhoto: nextHost.photoURL || '',
      hostConnected: connected,
      hostDisconnectedAt: connected ? null : (nextHost.disconnectedAt ?? Date.now()),
    });
  await pushSystemMessage(
    roomId,
    `${nextHost.displayName || 'Ẩn danh'} đã trở thành Chủ phòng mới`
  );
}

async function cleanupEmptyRoom(roomId: string): Promise<void> {
  const snap = await getDb().ref(`watch_party_rooms/${roomId}/members`).once('value');
  if (!snap.exists() || snap.numChildren() === 0) {
    await getDb().ref(`watch_party_rooms/${roomId}`).remove();
    await getDb().ref(`watch_party_lobby/${roomId}`).remove();
  }
}

async function reconcileStaleRoom(roomId: string, now = Date.now()): Promise<void> {
  const roomSnap = await getDb().ref(`watch_party_rooms/${roomId}`).once('value');
  if (!roomSnap.exists()) {
    await getDb().ref(`watch_party_lobby/${roomId}`).remove();
    return;
  }

  const room = roomSnap.val() as WatchPartyRoom;
  const members = Object.values(room.members || {}) as RoomMember[];
  if (members.length === 0) {
    await getDb().ref(`watch_party_rooms/${roomId}`).remove();
    await getDb().ref(`watch_party_lobby/${roomId}`).remove();
    return;
  }

  const host = room.members?.[room.hostId];
  const hostOffline = !host || host.connected === false;
  if (!hostOffline) return;

  const disconnectedAt = typeof host?.disconnectedAt === 'number' ? host.disconnectedAt : null;
  if (host && disconnectedAt == null) return;
  const offlineFor = disconnectedAt != null ? now - disconnectedAt : Number.POSITIVE_INFINITY;
  if (offlineFor < HOST_OFFLINE_GRACE_MS) return;

  const connectedGuests = members.filter((m) => m.connected !== false && m.uid !== room.hostId);
  if (connectedGuests.length === 0) {
    await getDb().ref(`watch_party_rooms/${roomId}`).remove();
    await getDb().ref(`watch_party_lobby/${roomId}`).remove();
    return;
  }

  const next = pickNextHost(members, room.hostId);
  if (next && next.uid !== room.hostId) {
    await transferHost(roomId, next);
  }
}

export const onWatchPartyMemberRemoved = functions.database
  .ref('/watch_party_rooms/{roomId}/members/{uid}')
  .onDelete(async (snapshot, context) => {
    const { roomId, uid } = context.params;
    const pendingSnap = await getDb()
      .ref(`watch_party_rooms/${roomId}/pendingLeaves/${uid}`)
      .once('value');
    await getDb().ref(`watch_party_rooms/${roomId}/pendingLeaves/${uid}`).remove();
    // Reserved for future leave metadata.
    void pendingSnap;

    const roomSnap = await getDb().ref(`watch_party_rooms/${roomId}`).once('value');
    if (!roomSnap.exists()) return;

    const room = roomSnap.val() as WatchPartyRoom;
    const memberList = Object.values(room.members || {}) as RoomMember[];
    const memberCount = memberList.length;

    await syncLobbyMemberCount(roomId, memberCount);

    if (uid === room.hostId && memberList.length > 0) {
      const nextHost = pickNextHost(memberList);
      if (nextHost) {
        await transferHost(roomId, nextHost);
      }
    }

    if (memberCount === 0) {
      await cleanupEmptyRoom(roomId);
    }
  });

export const onWatchPartyMemberAdded = functions.database
  .ref('/watch_party_rooms/{roomId}/members/{uid}')
  .onCreate(async (_snapshot, context) => {
    const { roomId } = context.params;
    const membersSnap = await getDb().ref(`watch_party_rooms/${roomId}/members`).once('value');
    await syncLobbyMemberCount(roomId, membersSnap.numChildren());
  });

export const onWatchPartyHostChanged = functions.database
  .ref('/watch_party_rooms/{roomId}/hostId')
  .onUpdate(async (change, context) => {
    const { roomId } = context.params;
    const before = change.before.val() as string;
    const after = change.after.val() as string;
    if (!after || before === after) return;

    // Keep the lobby projection in sync with room ownership.
    const memberSnap = await getDb()
      .ref(`watch_party_rooms/${roomId}/members/${after}`)
      .once('value');
    const member = memberSnap.val() as RoomMember | null;
    if (!member) return;

    const connected = member.connected !== false;
    await getDb()
      .ref(`watch_party_lobby/${roomId}`)
      .update({
        hostId: after,
        hostName: member.displayName || 'Ẩn danh',
        hostPhoto: member.photoURL || '',
        hostConnected: connected,
        hostDisconnectedAt: connected ? null : (member.disconnectedAt ?? Date.now()),
      });
  });

/** Removes or transfers rooms whose host reconnect window has expired. */
export const cleanupStaleWatchPartyRooms = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async () => {
    const lobbySnap = await getDb().ref('watch_party_lobby').once('value');
    if (!lobbySnap.exists()) return null;

    const now = Date.now();
    const jobs: Promise<void>[] = [];

    lobbySnap.forEach((child) => {
      const roomId = child.key;
      if (!roomId) return;
      const entry = child.val() as LobbyEntry;
      if (entry.hostConnected !== false) return;
      const at = typeof entry.hostDisconnectedAt === 'number' ? entry.hostDisconnectedAt : null;
      if (at == null || now - at < HOST_OFFLINE_GRACE_MS) return;
      jobs.push(reconcileStaleRoom(roomId, now));
    });

    await Promise.allSettled(jobs);
    return null;
  });
