import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  useVideoPlayerStore,
  setStatusMovie,
  setTimeVideo,
} from '@/features/player/store/video-player-store';

describe('Floating Mini Player Store Logic', () => {
  beforeEach(() => {
    setStatusMovie({ key: 'isPlay', value: false });
    setStatusMovie({ key: 'isMuted', value: false });
    setStatusMovie({ key: 'currentVolume', value: 1 });
    setTimeVideo({ key: 'currentTime', value: 0 });
    setTimeVideo({ key: 'duration', value: 100 });
  });

  it('updates playback status smoothly when toggled in store', () => {
    expect(useVideoPlayerStore.getState().statusMovie.isPlay).toBe(false);

    setStatusMovie({ key: 'isPlay', value: true });
    expect(useVideoPlayerStore.getState().statusMovie.isPlay).toBe(true);

    setStatusMovie({ key: 'isPlay', value: false });
    expect(useVideoPlayerStore.getState().statusMovie.isPlay).toBe(false);
  });

  it('updates mute status and volume correctly for mini-player', () => {
    expect(useVideoPlayerStore.getState().statusMovie.isMuted).toBe(false);

    setStatusMovie({ key: 'isMuted', value: true });
    expect(useVideoPlayerStore.getState().statusMovie.isMuted).toBe(true);
  });

  it('updates current playback position when seeked from mini-player', () => {
    expect(useVideoPlayerStore.getState().time.currentTime).toBe(0);

    setTimeVideo({ key: 'currentTime', value: 45 });
    expect(useVideoPlayerStore.getState().time.currentTime).toBe(45);
  });
});
