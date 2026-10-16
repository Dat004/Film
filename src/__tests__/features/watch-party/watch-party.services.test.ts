import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase/database
const mockGetDatabase = vi.fn(() => ({}));
const mockRef = vi.fn((_db, path) => ({ path }));
const mockSet = vi.fn().mockResolvedValue(undefined);
const mockGet = vi.fn();
const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockRemove = vi.fn().mockResolvedValue(undefined);
const mockPush = vi.fn((...args: any[]) => ({ path: `${args[0]?.path || ''}/mock-id` }));
const mockOnDisconnect = vi.fn((..._args: any[]) => ({
  cancel: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
}));
const mockServerTimestamp = vi.fn(() => 999999999);
const mockQuery = vi.fn();
const mockOrderByChild = vi.fn();
const mockLimitToLast = vi.fn();

vi.mock('firebase/database', () => ({
  getDatabase: () => mockGetDatabase(),
  ref: (db: any, path: any) => mockRef(db, path),
  set: (...args: any[]) => mockSet(...args),
  get: (...args: any[]) => mockGet(...args),
  update: (...args: any[]) => mockUpdate(...args),
  remove: (...args: any[]) => mockRemove(...args),
  push: (...args: any[]) => mockPush(...args),
  onDisconnect: (...args: any[]) => mockOnDisconnect(...args),
  serverTimestamp: () => mockServerTimestamp(),
  query: (...args: any[]) => mockQuery(...args),
  orderByChild: (...args: any[]) => mockOrderByChild(...args),
  limitToLast: (...args: any[]) => mockLimitToLast(...args),
}));

// Import modular services
import {
  sendMessage,
  sendReaction,
  sendSystemMessage,
} from '@/features/watch-party/services/chat.service';
import {
  buildLobbyEntry,
  setLobbyMemberCount,
  getPublicRooms,
} from '@/features/watch-party/services/lobby.service';
import {
  transferHost,
  repairOrphanHost,
  kickMember,
} from '@/features/watch-party/services/member.service';
import { createRoom, destroyRoom, leaveRoom } from '@/features/watch-party/services/room.service';
import { updateVideoSync } from '@/features/watch-party/services/sync.service';

describe('Watch Party Modular Services (Phase 1 Refactoring)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Chat Service', () => {
    it('sendMessage writes trimmed text to messages ref', async () => {
      const user = { uid: 'user-1', displayName: 'Alice' };
      await sendMessage('room-123', user, '  Hello party!  ');

      expect(mockPush).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'user-1',
          displayName: 'Alice',
          text: 'Hello party!',
        })
      );
    });

    it('sendMessage ignores empty or whitespace-only message', async () => {
      const user = { uid: 'user-1', displayName: 'Alice' };
      await sendMessage('room-123', user, '   ');

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('sendReaction pushes emoji reaction to reactions ref', async () => {
      const user = { uid: 'user-2', displayName: 'Bob' };
      await sendReaction('room-123', user, '🔥');

      expect(mockPush).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'user-2',
          displayName: 'Bob',
          emoji: '🔥',
        })
      );
    });

    it('sendSystemMessage formats system notification message', async () => {
      await sendSystemMessage('room-123', 'Người dùng đã tham gia');

      expect(mockPush).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'system',
          displayName: 'Hệ thống',
          text: 'Người dùng đã tham gia',
          type: 'system',
        })
      );
    });
  });

  describe('2. Sync Service', () => {
    it('updateVideoSync updates playback status correctly', async () => {
      await updateVideoSync('room-123', {
        isPlaying: true,
        currentTime: 120.5,
        playbackRate: 1.25,
        currentEpisode: 2,
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'watch_party_rooms/room-123/status' }),
        expect.objectContaining({
          isPlaying: true,
          currentTime: 120.5,
          playbackRate: 1.25,
          currentEpisode: 2,
        })
      );
    });
  });

  describe('3. Lobby Service', () => {
    it('buildLobbyEntry constructs valid schema', () => {
      const host = {
        uid: 'host-1',
        displayName: 'Host Name',
        photoURL: 'https://img.com/avatar.jpg',
      };
      const filmMeta = { name: 'Inception', posterUrl: 'https://img.com/poster.jpg' };

      const entry = buildLobbyEntry('room-abc', host, 'film-99', filmMeta, false, 1);

      expect(entry).toMatchObject({
        roomId: 'room-abc',
        hostId: 'host-1',
        creatorId: 'host-1',
        filmId: 'film-99',
        filmName: 'Inception',
        posterUrl: 'https://img.com/poster.jpg',
        isPrivate: false,
        memberCount: 1,
        hostConnected: true,
      });
    });

    it('setLobbyMemberCount updates memberCount in RTDB', async () => {
      await setLobbyMemberCount('room-123', 5);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'watch_party_lobby/room-123/memberCount' }),
        5
      );
    });

    it('getPublicRooms returns empty array when no lobby rooms exist', async () => {
      mockGet.mockResolvedValueOnce({
        exists: () => false,
      });

      const rooms = await getPublicRooms();
      expect(rooms).toEqual([]);
    });
  });

  describe('4. Member & Host Management Service', () => {
    it('transferHost updates room host, lobby host and sends system message', async () => {
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({
          displayName: 'New Host Charlie',
          photoURL: 'https://pic.jpg',
          connected: true,
        }),
      });

      await transferHost('room-123', 'user-charlie');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'watch_party_rooms/room-123/hostId': 'user-charlie',
          'watch_party_lobby/room-123/hostId': 'user-charlie',
          'watch_party_lobby/room-123/hostName': 'New Host Charlie',
        })
      );
    });

    it('repairOrphanHost transfers to next member when current host left', async () => {
      const members = {
        'member-2': {
          uid: 'member-2',
          displayName: 'M2',
          photoURL: '',
          joinedAt: 100,
          connected: true,
        },
        'member-3': {
          uid: 'member-3',
          displayName: 'M3',
          photoURL: '',
          joinedAt: 200,
          connected: true,
        },
      };

      // mock snapshot for transferHost
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => members['member-2'],
      });

      await repairOrphanHost('room-123', members as any, 'old-host-missing');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'watch_party_rooms/room-123/hostId': 'member-2',
        })
      );
    });

    it('kickMember removes member and updates lobby count', async () => {
      // 1st get: member data
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ displayName: 'TrollUser' }),
      });
      // 2nd get: remaining members
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({ 'host-1': {} }),
      });

      await kickMember('room-123', 'troll-user-id');

      expect(mockRemove).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'watch_party_rooms/room-123/members/troll-user-id' })
      );
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'watch_party_lobby/room-123/memberCount' }),
        1
      );
    });
  });

  describe('5. Room Lifecycle Service', () => {
    it('createRoom creates room and lobby entry atomically', async () => {
      const host = { uid: 'host-1', displayName: 'Host 1' };
      const filmMeta = { name: 'Matrix', posterUrl: 'https://matrix.jpg' };

      const roomId = await createRoom(host, 'film-matrix', filmMeta);

      expect(roomId).toBeDefined();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          [`watch_party_rooms/${roomId}`]: expect.objectContaining({
            hostId: 'host-1',
            filmId: 'film-matrix',
            isPrivate: false,
          }),
          [`watch_party_lobby/${roomId}`]: expect.objectContaining({
            hostId: 'host-1',
            filmName: 'Matrix',
            memberCount: 1,
          }),
        })
      );
    });

    it('destroyRoom wipes both room and lobby entries', async () => {
      await destroyRoom('room-to-delete');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'watch_party_rooms/room-to-delete': null,
          'watch_party_lobby/room-to-delete': null,
        })
      );
    });

    it('leaveRoom atomically destroys room when last member leaves', async () => {
      mockGet.mockResolvedValueOnce({
        exists: () => true,
        val: () => ({
          members: { 'solo-user': { uid: 'solo-user', displayName: 'Solo' } },
          hostId: 'solo-user',
        }),
      });

      await leaveRoom('room-solo', 'solo-user', true, null);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'watch_party_rooms/room-solo': null,
          'watch_party_lobby/room-solo': null,
        })
      );
    });
  });
});
