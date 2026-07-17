'use client';

import { useRef, useEffect } from 'react';

import type { FilmDetail, EpisodeServerData } from '@/features/film';

import { CONTINUE_WATCHING_PROGRESS_MIN_S } from '../constants/playback.constants';
import {
  saveContinueWatchingItem,
  setupContinueWatchingOnDisconnect,
} from '../services/continue-watching.service';
import { setMovieData, resetEpisode, resetMovie, resetTime } from '../store/video-player-store';

interface TrackerParams {
  movie: FilmDetail | undefined;
  dataEpisodes: EpisodeServerData[] | undefined;
  currentEpisode: number;
  currentTime: number;
  duration: number;
  uid: string | null | undefined;
  isLogged: boolean;
  continueWatching: unknown[];
  enabled?: boolean;
}

/**
 * Orchestrates continue-watching snapshots + store reset per film.
 * Persistence lives in continue-watching.service (no Firebase in this file).
 */
export function useContinueWatchingTracker({
  movie,
  dataEpisodes,
  currentEpisode,
  currentTime,
  duration,
  uid,
  isLogged,
  continueWatching,
  enabled = true,
}: TrackerParams) {
  const watchingDataRef = useRef<Record<string, unknown> | null>(null);
  const currentEpisodeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const filmKey = movie?._id || movie?.slug || '';

  useEffect(() => {
    if (!enabled) return;
    if (currentTime > CONTINUE_WATCHING_PROGRESS_MIN_S) {
      currentTimeRef.current = currentTime;
      durationRef.current = duration;
    }
  }, [currentTime, duration, enabled]);

  useEffect(() => {
    currentTimeRef.current = 0;
  }, [currentEpisode]);

  useEffect(() => {
    if (!enabled) return;
    if (currentTime > CONTINUE_WATCHING_PROGRESS_MIN_S && movie && dataEpisodes) {
      currentEpisodeRef.current = currentEpisode;
      watchingDataRef.current = {
        ...movie,
        watching: {
          currentTime: currentTimeRef.current,
          duration: durationRef.current,
          currentEpisode: currentEpisodeRef.current,
          episode_info: { ...dataEpisodes[currentEpisodeRef.current] },
        },
      };
    }
  }, [currentTime, currentEpisode, dataEpisodes, movie, enabled]);

  useEffect(() => {
    if (!enabled || !filmKey) return;

    watchingDataRef.current = null;
    currentEpisodeRef.current = 0;
    currentTimeRef.current = 0;
    durationRef.current = 0;

    if (movie) setMovieData(movie as unknown as Record<string, unknown>);

    return () => {
      if (isLogged && watchingDataRef.current && uid) {
        void saveContinueWatchingItem(uid, watchingDataRef.current);
      }
      resetTime();
      resetEpisode();
      resetMovie();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, filmKey]);

  const handleDisconnect = () => {
    if (!enabled || !uid || !watchingDataRef.current) return;
    const id = watchingDataRef.current._id as string;
    const matchingData = (continueWatching || []).some(
      (item) => (item as Record<string, unknown>)._id === id
    );

    setupContinueWatchingOnDisconnect(
      uid,
      watchingDataRef.current,
      matchingData ? 'updateWatching' : 'setFull'
    );
  };

  return { handleDisconnect };
}

export default useContinueWatchingTracker;
