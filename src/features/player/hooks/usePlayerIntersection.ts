'use client';

import { useEffect, useState, useCallback, type RefObject } from 'react';

import { useVideoPlayerStore } from '../store/video-player-store';

export function usePlayerIntersection(targetRef: RefObject<HTMLElement | null>) {
  const [isOutOfView, setIsOutOfView] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [hasActivePlayback, setHasActivePlayback] = useState(false);

  const isPlay = useVideoPlayerStore((s) => s.statusMovie.isPlay);
  const currentTime = useVideoPlayerStore((s) => s.time.currentTime);
  const isFullScreen = useVideoPlayerStore((s) => s.statusMovie.isFullScreen);

  // Track if video has started playing so seeking doesn't flicker the floating state
  useEffect(() => {
    if (isPlay || currentTime > 0) {
      setHasActivePlayback(true);
    }
  }, [isPlay, currentTime]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        setIsOutOfView(!entry.isIntersecting);
        // When main player comes back into view, reset manual close state
        if (entry.isIntersecting) {
          setIsClosed(false);
        }
      },
      {
        threshold: 0.1, // Trigger when less than 10% of main player is visible
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetRef]);

  const restoreToPlayer = useCallback(() => {
    const el = targetRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [targetRef]);

  const isFloating = isOutOfView && hasActivePlayback && !isClosed && !isFullScreen;

  return {
    isOutOfView,
    isFloating,
    isClosed,
    setIsClosed,
    restoreToPlayer,
  };
}
