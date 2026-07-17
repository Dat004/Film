'use client';

import { useCallback } from 'react';

import { setCurrentEpisode, setTimeVideo } from '@/features/player';
import { useRealtimeDbFirebase } from '@/hooks';

import type { ContinueWatchingCardItem } from '../types/continue-watching.types';

export function continueWatchingItemPath(uid: string, id: string): string {
  return `/continue_watching/${uid}/${id}`;
}

export function useContinueWatchingActions(uid: string) {
  const { removeDb } = useRealtimeDbFirebase();

  const removeItem = useCallback(
    async (id: string) => {
      if (!uid || !id) return;
      await removeDb({ path: continueWatchingItemPath(uid, id) });
    },
    [removeDb, uid]
  );

  const resumePlayback = useCallback((item: ContinueWatchingCardItem) => {
    const watching = item.watching;
    if (!watching) return;
    setCurrentEpisode(watching.currentEpisode);
    setTimeVideo({ key: 'currentTime', value: watching.currentTime });
    setTimeVideo({ key: 'duration', value: watching.duration });
  }, []);

  return { removeItem, resumePlayback };
}
