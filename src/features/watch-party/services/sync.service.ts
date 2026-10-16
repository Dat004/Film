import { getDatabase, ref, update } from 'firebase/database';

import { trackWatchPartyEvent } from '../lib/watch-party.telemetry';

export interface VideoSyncPayload {
  isPlaying: boolean;
  currentTime: number;
  currentEpisode?: number;
  playbackRate?: number;
  autoPlay?: boolean;
  autoNext?: boolean;
  seekSeq?: number;
}

/** Updates playback state published by the host. */
export const updateVideoSync = async (roomId: string, payload: VideoSyncPayload): Promise<void> => {
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
