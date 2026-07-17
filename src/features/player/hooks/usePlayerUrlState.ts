'use client';

import { useEffect, useRef } from 'react';

import { parseEpisodeQuery } from '../lib/player-url';
import { setCurrentEpisode, setTimeVideo } from '../store/video-player-store';

/**
 * Hydrate episode index + resume time from ?ep=&t= once per film.
 * Returns whether a resume timestamp existed in the URL (for intent logic).
 */
export function usePlayerUrlState(options: {
  episodeCount: number;
  filmKey: string;
  enabled?: boolean;
}): { hasResumeTime: boolean } {
  const { episodeCount, filmKey, enabled = true } = options;
  const hasResumeTimeRef = useRef(false);

  useEffect(() => {
    if (!enabled || episodeCount === 0 || typeof window === 'undefined') return;

    const { episodeIndex, resumeTime } = parseEpisodeQuery(window.location.search, episodeCount);

    if (episodeIndex != null) {
      setCurrentEpisode(episodeIndex);
    }
    if (resumeTime != null) {
      hasResumeTimeRef.current = true;
      setTimeVideo({ key: 'currentTime', value: resumeTime });
    }
  }, [episodeCount, enabled, filmKey]);

  return { hasResumeTime: hasResumeTimeRef.current };
}
