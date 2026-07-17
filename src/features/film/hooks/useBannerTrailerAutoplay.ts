import { useCallback, useEffect, useRef, useState } from 'react';

import { BANNER_TRAILER_DELAY_MS } from '../constants/banner.constants';

function canPlayBannerTrailer(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.visibilityState !== 'visible') return false;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  if (reduceMotion) return false;

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;

  return true;
}

/** Controls trailer playback while the pointer remains over the banner. */
export function useBannerTrailerAutoplay(
  trailerId: string | null,
  pointerInside: boolean,
  delayMs: number = BANNER_TRAILER_DELAY_MS
) {
  const [shouldPlayTrailer, setShouldPlayTrailer] = useState(false);
  const [trailerFailed, setTrailerFailed] = useState(false);

  const pointerInsideRef = useRef(pointerInside);
  const trailerIdRef = useRef(trailerId);
  const trailerFailedRef = useRef(trailerFailed);
  const trailerTimerRef = useRef<number | null>(null);
  const trailerFailSafeRef = useRef<number | null>(null);

  pointerInsideRef.current = pointerInside;
  trailerIdRef.current = trailerId;
  trailerFailedRef.current = trailerFailed;

  const clearTimers = useCallback(() => {
    if (trailerTimerRef.current) {
      window.clearTimeout(trailerTimerRef.current);
      trailerTimerRef.current = null;
    }
    if (trailerFailSafeRef.current) {
      window.clearTimeout(trailerFailSafeRef.current);
      trailerFailSafeRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    setShouldPlayTrailer(false);
  }, [clearTimers]);

  const schedule = useCallback(() => {
    const id = trailerIdRef.current;
    if (!id || trailerFailedRef.current || !pointerInsideRef.current) return;
    if (!canPlayBannerTrailer()) return;

    clearTimers();
    trailerTimerRef.current = window.setTimeout(() => {
      if (!pointerInsideRef.current || !trailerIdRef.current) return;
      if (trailerFailedRef.current) return;
      if (document.visibilityState !== 'visible') return;
      setShouldPlayTrailer(true);
    }, delayMs);
  }, [delayMs, clearTimers]);

  // Reset trailer state when the active slide changes.
  useEffect(() => {
    setTrailerFailed(false);
    setShouldPlayTrailer(false);
    clearTimers();

    if (pointerInsideRef.current && trailerId) {
      // Schedule after the reset has been applied.
      const t = window.setTimeout(() => schedule(), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [trailerId, schedule, clearTimers]);

  useEffect(() => {
    if (pointerInside && trailerId && !trailerFailed) {
      schedule();
    } else if (!pointerInside) {
      stop();
    }
    return () => clearTimers();
  }, [pointerInside, trailerId, trailerFailed, schedule, stop, clearTimers]);

  const onIframeLoad = useCallback(() => {
    if (trailerFailSafeRef.current) window.clearTimeout(trailerFailSafeRef.current);
    trailerFailSafeRef.current = window.setTimeout(() => {
      // Defer failure handling while the pointer remains over the banner.
      if (pointerInsideRef.current) return;
      setTrailerFailed(true);
      setShouldPlayTrailer(false);
    }, 2500);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') stop();
      else if (pointerInsideRef.current && trailerIdRef.current) schedule();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [stop, schedule]);

  return {
    shouldPlayTrailer,
    trailerFailed,
    onIframeLoad,
    stop,
  };
}
