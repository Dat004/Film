import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  parseEpisodeQuery,
  buildEpisodeQueryUrl,
  syncEpisodeQueryToWindow,
} from '@/features/player/lib/player-url';

describe('parseEpisodeQuery', () => {
  const EPISODE_COUNT = 10;

  it('returns empty object when search has no ep/t', () => {
    expect(parseEpisodeQuery('', EPISODE_COUNT)).toEqual({});
    expect(parseEpisodeQuery('?', EPISODE_COUNT)).toEqual({});
    expect(parseEpisodeQuery('foo=1', EPISODE_COUNT)).toEqual({});
  });

  it('parses 1-based ep into 0-based episodeIndex', () => {
    expect(parseEpisodeQuery('?ep=1', EPISODE_COUNT)).toEqual({ episodeIndex: 0 });
    expect(parseEpisodeQuery('ep=3', EPISODE_COUNT)).toEqual({ episodeIndex: 2 });
    expect(parseEpisodeQuery('?ep=10', EPISODE_COUNT)).toEqual({ episodeIndex: 9 });
  });

  it('clamps negative ep to index 0', () => {
    // parseInt("-2") - 1 = -3 → Math.max(0, -3) = 0
    expect(parseEpisodeQuery('?ep=-2', EPISODE_COUNT)).toEqual({ episodeIndex: 0 });
  });

  it('ignores ep out of range (>= episodeCount)', () => {
    expect(parseEpisodeQuery('?ep=11', EPISODE_COUNT)).toEqual({});
    expect(parseEpisodeQuery('?ep=100', EPISODE_COUNT)).toEqual({});
  });

  it('ignores non-numeric ep', () => {
    expect(parseEpisodeQuery('?ep=abc', EPISODE_COUNT)).toEqual({});
    expect(parseEpisodeQuery('?ep=', EPISODE_COUNT)).toEqual({});
  });

  it('parses resume time t when > 0', () => {
    expect(parseEpisodeQuery('?t=120', EPISODE_COUNT)).toEqual({ resumeTime: 120 });
    expect(parseEpisodeQuery('?t=12.5', EPISODE_COUNT)).toEqual({ resumeTime: 12.5 });
  });

  it('ignores t <= 0 or invalid', () => {
    expect(parseEpisodeQuery('?t=0', EPISODE_COUNT)).toEqual({});
    expect(parseEpisodeQuery('?t=-10', EPISODE_COUNT)).toEqual({});
    expect(parseEpisodeQuery('?t=nan', EPISODE_COUNT)).toEqual({});
  });

  it('parses ep and t together', () => {
    expect(parseEpisodeQuery('?ep=2&t=90', EPISODE_COUNT)).toEqual({
      episodeIndex: 1,
      resumeTime: 90,
    });
  });

  it('accepts search with or without leading ?', () => {
    expect(parseEpisodeQuery('ep=4&t=30', EPISODE_COUNT)).toEqual({
      episodeIndex: 3,
      resumeTime: 30,
    });
    expect(parseEpisodeQuery('?ep=4&t=30', EPISODE_COUNT)).toEqual({
      episodeIndex: 3,
      resumeTime: 30,
    });
  });

  it('returns empty when episodeCount is 0', () => {
    expect(parseEpisodeQuery('?ep=1&t=10', 0)).toEqual({ resumeTime: 10 });
  });
});

describe('buildEpisodeQueryUrl', () => {
  it('sets 1-based ep and drops t', () => {
    const next = buildEpisodeQueryUrl('https://example.com/phim/abc?ep=1&t=120', 4);
    expect(next).toBe('/phim/abc?ep=5');
  });

  it('preserves hash and other query params', () => {
    const next = buildEpisodeQueryUrl('https://example.com/phim/abc?foo=1&ep=2&t=50#chat', 0);
    expect(next).toBe('/phim/abc?foo=1&ep=1#chat');
    expect(next).not.toContain('t=');
  });

  it('writes ep=1 for episodeIndex 0', () => {
    expect(buildEpisodeQueryUrl('https://example.com/phim/x', 0)).toBe('/phim/x?ep=1');
  });
});

describe('syncEpisodeQueryToWindow', () => {
  const replaceState = vi.fn();

  beforeEach(() => {
    replaceState.mockClear();
    vi.stubGlobal('window', {
      location: {
        href: 'https://example.com/phim/demo?ep=1&t=99',
        pathname: '/phim/demo',
        search: '?ep=1&t=99',
        hash: '',
      },
      history: {
        state: { keep: true },
        replaceState,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('replaceState with new ep and without t', () => {
    syncEpisodeQueryToWindow(2);
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenCalledWith({ keep: true }, '', '/phim/demo?ep=3');
  });
});
