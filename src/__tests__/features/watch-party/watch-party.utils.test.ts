import { describe, it, expect } from 'vitest';

import {
  sortRoomMessages,
  dedupeSystemMessages,
  pickNextHost,
  buildLobbyFromLegacyRoom,
  decideStaleRoomAction,
  isLobbyHostOfflinePastGrace,
  toEpochMs,
} from '@/features/watch-party/lib/watch-party.utils';
import type { RoomMember } from '@/features/watch-party/types/watch-party.types';

describe('sortRoomMessages', () => {
  it('returns empty array for null/undefined', () => {
    expect(sortRoomMessages(null)).toEqual([]);
    expect(sortRoomMessages(undefined)).toEqual([]);
  });

  it('sorts by timestamp and attaches ids', () => {
    const result = sortRoomMessages({
      b: { uid: 'u2', displayName: 'B', text: 'hi', timestamp: 200 },
      a: { uid: 'u1', displayName: 'A', text: 'hey', timestamp: 100 },
    });

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('a');
    expect(result[1]?.id).toBe('b');
  });
});

describe('dedupeSystemMessages', () => {
  it('drops consecutive duplicate system texts within window', () => {
    const result = dedupeSystemMessages([
      {
        uid: 'system',
        displayName: 'Hệ thống',
        text: 'A đã tham gia phòng',
        type: 'system',
        timestamp: 100,
      },
      {
        uid: 'system',
        displayName: 'Hệ thống',
        text: 'A đã tham gia phòng',
        type: 'system',
        timestamp: 250,
      },
      { uid: 'u1', displayName: 'A', text: 'hi', timestamp: 300 },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]?.text).toBe('A đã tham gia phòng');
    expect(result[1]?.text).toBe('hi');
  });
});

describe('pickNextHost', () => {
  it('picks earliest joined member', () => {
    const members = [
      { uid: 'b', displayName: 'B', photoURL: '', joinedAt: 200 },
      { uid: 'a', displayName: 'A', photoURL: '', joinedAt: 100 },
    ];
    expect(pickNextHost(members)?.uid).toBe('a');
  });

  it('excludes specified uid', () => {
    const members = [
      { uid: 'host', displayName: 'H', photoURL: '', joinedAt: 50 },
      { uid: 'guest', displayName: 'G', photoURL: '', joinedAt: 100 },
    ];
    expect(pickNextHost(members, 'host')?.uid).toBe('guest');
  });

  it('prefers connected members', () => {
    const members = [
      { uid: 'offline', displayName: 'O', photoURL: '', joinedAt: 50, connected: false },
      { uid: 'online', displayName: 'N', photoURL: '', joinedAt: 100, connected: true },
    ];
    expect(pickNextHost(members)?.uid).toBe('online');
  });
});

describe('buildLobbyFromLegacyRoom', () => {
  it('builds lobby entry from legacy filmData', () => {
    const entry = buildLobbyFromLegacyRoom('room1', {
      roomId: 'room1',
      hostId: 'h1',
      filmId: '',
      isPrivate: false,
      passwordHash: null,
      status: { isPlaying: false, currentTime: 0, currentEpisode: 0 },
      members: {
        h1: { uid: 'h1', displayName: 'Host', photoURL: '', joinedAt: 1 },
      },
      createdAt: 1000,
      filmData: {
        movie: {
          slug: 'phim-a',
          name: 'Phim A',
          poster_url: '/poster.jpg',
          category: [{ name: 'Hành động' }],
        },
      },
    });

    expect(entry?.filmId).toBe('phim-a');
    expect(entry?.filmName).toBe('Phim A');
    expect(entry?.memberCount).toBe(1);
    expect(entry?.categoryName).toBe('Hành động');
    expect(entry?.hostConnected).toBe(true);
  });
});

describe('toEpochMs', () => {
  it('reads number timestamps', () => {
    expect(toEpochMs(1_700_000_000_000)).toBe(1_700_000_000_000);
    expect(toEpochMs(null)).toBeNull();
    expect(toEpochMs(0)).toBeNull();
    expect(toEpochMs(-1)).toBeNull();
    expect(toEpochMs('1700000000000')).toBeNull();
  });

  it('reads Firebase-like { seconds } objects', () => {
    expect(toEpochMs({ seconds: 1_700_000_000 })).toBe(1_700_000_000_000);
    expect(toEpochMs({ seconds: 'bad' })).toBeNull();
  });
});

describe('pickNextHost edge cases', () => {
  it('returns null for empty list', () => {
    expect(pickNextHost([])).toBeNull();
  });

  it('falls back to offline members when none connected', () => {
    const members = [
      { uid: 'b', displayName: 'B', photoURL: '', joinedAt: 200, connected: false },
      { uid: 'a', displayName: 'A', photoURL: '', joinedAt: 100, connected: false },
    ];
    expect(pickNextHost(members)?.uid).toBe('a');
  });

  it('falls back to offline when excluding host leaves only offline guests', () => {
    const members = [
      { uid: 'host', displayName: 'H', photoURL: '', joinedAt: 1, connected: false },
      { uid: 'g1', displayName: 'G', photoURL: '', joinedAt: 50, connected: false },
    ];
    expect(pickNextHost(members, 'host')?.uid).toBe('g1');
  });
});

describe('decideStaleRoomAction', () => {
  const grace = 15 * 60 * 1000;
  const now = 1_000_000_000;

  const offlineHost = (disconnectedAt: number | null): RoomMember => ({
    uid: 'h1',
    displayName: 'H',
    photoURL: '',
    joinedAt: 1,
    connected: false,
    disconnectedAt,
  });

  it('destroys empty room', () => {
    expect(decideStaleRoomAction({ hostId: 'h1', members: {} }, now, grace)).toEqual({
      action: 'destroy',
    });
  });

  it('noops when host is still online', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: {
          h1: {
            uid: 'h1',
            displayName: 'H',
            photoURL: '',
            joinedAt: 1,
            connected: true,
            disconnectedAt: null,
          },
        },
      },
      now,
      grace
    );
    expect(result.action).toBe('noop');
  });

  it('noops when host offline but disconnectedAt missing (race)', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: { h1: offlineHost(null) },
      },
      now,
      grace
    );
    expect(result.action).toBe('noop');
  });

  it('keeps room during grace', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: { h1: offlineHost(now - grace + 60_000) },
      },
      now,
      grace
    );
    expect(result.action).toBe('noop');
  });

  it('noops at exact grace boundary (strict < grace)', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: { h1: offlineHost(now - grace) },
      },
      now,
      grace
    );
    expect(result.action).toBe('destroy');
  });

  it('destroys when host alone past grace', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: { h1: offlineHost(now - grace - 1) },
      },
      now,
      grace
    );
    expect(result.action).toBe('destroy');
  });

  it('destroys when host missing from members (orphan hostId)', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'missing',
        members: {
          g1: {
            uid: 'g1',
            displayName: 'G',
            photoURL: '',
            joinedAt: 2,
            connected: false,
            disconnectedAt: now - grace - 1,
          },
        },
      },
      now,
      grace
    );
    expect(result.action).toBe('destroy');
  });

  it('transfers orphan hostId to connected guest', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'missing',
        members: {
          g1: {
            uid: 'g1',
            displayName: 'G',
            photoURL: '',
            joinedAt: 2,
            connected: true,
          },
        },
      },
      now,
      grace
    );
    expect(result).toEqual({ action: 'transfer', nextHostId: 'g1' });
  });

  it('destroys when all guests also offline past grace', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: {
          h1: offlineHost(now - grace - 1),
          g1: {
            uid: 'g1',
            displayName: 'G',
            photoURL: '',
            joinedAt: 2,
            connected: false,
            disconnectedAt: now - 1_000,
          },
        },
      },
      now,
      grace
    );
    expect(result.action).toBe('destroy');
  });

  it('transfers to connected guest past grace', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: {
          h1: offlineHost(now - grace - 1),
          g1: {
            uid: 'g1',
            displayName: 'G',
            photoURL: '',
            joinedAt: 2,
            connected: true,
          },
        },
      },
      now,
      grace
    );
    expect(result).toEqual({ action: 'transfer', nextHostId: 'g1' });
  });

  it('transfers to earliest-joined connected guest among many', () => {
    const result = decideStaleRoomAction(
      {
        hostId: 'h1',
        members: {
          h1: offlineHost(now - grace - 1),
          g2: {
            uid: 'g2',
            displayName: 'G2',
            photoURL: '',
            joinedAt: 300,
            connected: true,
          },
          g1: {
            uid: 'g1',
            displayName: 'G1',
            photoURL: '',
            joinedAt: 100,
            connected: true,
          },
          gOffline: {
            uid: 'gOffline',
            displayName: 'Off',
            photoURL: '',
            joinedAt: 50,
            connected: false,
          },
        },
      },
      now,
      grace
    );
    expect(result).toEqual({ action: 'transfer', nextHostId: 'g1' });
  });
});

describe('isLobbyHostOfflinePastGrace', () => {
  const now = 1_000_000_000;
  const grace = 15 * 60 * 1000;

  it('detects stale lobby host', () => {
    expect(
      isLobbyHostOfflinePastGrace(
        { hostConnected: false, hostDisconnectedAt: now - grace - 1 },
        now,
        grace
      )
    ).toBe(true);
  });

  it('is true at exact grace boundary (>=)', () => {
    expect(
      isLobbyHostOfflinePastGrace(
        { hostConnected: false, hostDisconnectedAt: now - grace },
        now,
        grace
      )
    ).toBe(true);
  });

  it('is false during grace window', () => {
    expect(
      isLobbyHostOfflinePastGrace(
        { hostConnected: false, hostDisconnectedAt: now - 60_000 },
        now,
        grace
      )
    ).toBe(false);
  });

  it('is false when host still connected', () => {
    expect(
      isLobbyHostOfflinePastGrace({ hostConnected: true, hostDisconnectedAt: null }, now, grace)
    ).toBe(false);
  });

  it('is false when hostConnected omitted (legacy lobby)', () => {
    expect(isLobbyHostOfflinePastGrace({ hostDisconnectedAt: now - grace - 1 }, now, grace)).toBe(
      false
    );
  });

  it('is false when disconnectedAt missing', () => {
    expect(
      isLobbyHostOfflinePastGrace({ hostConnected: false, hostDisconnectedAt: null }, now, grace)
    ).toBe(false);
  });
});

describe('buildLobbyFromLegacyRoom hostConnected', () => {
  it('marks hostConnected false when host soft-disconnected', () => {
    const entry = buildLobbyFromLegacyRoom('room1', {
      roomId: 'room1',
      hostId: 'h1',
      filmId: 'slug-a',
      isPrivate: false,
      passwordHash: null,
      status: { isPlaying: false, currentTime: 0, currentEpisode: 0 },
      members: {
        h1: {
          uid: 'h1',
          displayName: 'Host',
          photoURL: '/h.jpg',
          joinedAt: 1,
          connected: false,
          disconnectedAt: 1_700_000_000_000,
        },
      },
      createdAt: 1000,
    });

    expect(entry?.hostConnected).toBe(false);
    expect(entry?.hostDisconnectedAt).toBe(1_700_000_000_000);
    expect(entry?.filmId).toBe('slug-a');
  });

  it('returns null when filmId cannot be resolved', () => {
    expect(
      buildLobbyFromLegacyRoom('room1', {
        roomId: 'room1',
        hostId: 'h1',
        filmId: '',
        isPrivate: false,
        passwordHash: null,
        status: { isPlaying: false, currentTime: 0, currentEpisode: 0 },
        members: {
          h1: { uid: 'h1', displayName: 'Host', photoURL: '', joinedAt: 1 },
        },
        createdAt: 1000,
      })
    ).toBeNull();
  });
});
