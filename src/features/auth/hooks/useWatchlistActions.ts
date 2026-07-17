'use client';

import { useRealtimeDbFirebase } from '@/hooks';

import type { WatchListGroup } from '../types/auth.types';

export function isFilmInWatchList(
  listWatching: WatchListGroup[] | undefined,
  filmId?: string
): boolean {
  if (!filmId) return false;
  return (listWatching || []).some((group) => group.data?.some((item) => item?._id === filmId));
}

export function watchListItemPath(uid: string, filmId: string): string {
  return `/list_video/${uid}/${filmId}`;
}

/**
 * Watchlist RTDB ops owned by auth (user data). UI passes filmId only.
 */
export function useWatchlistActions(uid: string | null | undefined) {
  const { removeDb } = useRealtimeDbFirebase();

  const removeFromWatchList = async (filmId?: string) => {
    if (!uid || !filmId) return;
    await removeDb({ path: watchListItemPath(uid, filmId) });
  };

  return { removeFromWatchList, isFilmInWatchList };
}
