import { useCallback, useEffect, useRef, useState } from 'react';

import { PREVIEW_TRAILER_DELAY_MS } from '../constants/preview.constants';

function canAutoplayPreviewTrailer(): boolean {
  if (typeof window === 'undefined') return false;

  // Desktop-only (no autoplay on touch devices / coarse pointers)
  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches ?? false;
  if (!canHover) return false;

  // Respect reduced motion
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  if (reduceMotion) return false;

  // Avoid autoplay when tab is not visible
  if (document.visibilityState !== 'visible') return false;

  // Save-Data / slow network heuristics
  const conn = (navigator as any)?.connection as
    { saveData?: boolean; effectiveType?: string } | undefined;
  if (conn?.saveData) return false;
  const effectiveType = conn?.effectiveType;
  if (effectiveType && ['slow-2g', '2g', '3g'].includes(effectiveType)) return false;

  return true;
}

export function usePreviewTrailerAutoplay(
  trailerId: string | null,
  delayMs: number = PREVIEW_TRAILER_DELAY_MS
) {
  const [shouldPlayTrailer, setShouldPlayTrailer] = useState(false);
  const [trailerFailed, setTrailerFailed] = useState(false);

  const isHoveringRef = useRef(false);
  const trailerTimerRef = useRef<number | null>(null);
  const trailerFailSafeRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (trailerTimerRef.current) {
      window.clearTimeout(trailerTimerRef.current);
      trailerTimerRef.current = null;
    }
    if (trailerFailSafeRef.current) {
      window.clearTimeout(trailerFailSafeRef.current);
      trailerFailSafeRef.current = null;
    }
    setShouldPlayTrailer(false);
  }, []);

  const schedule = () => {
    if (!trailerId || trailerFailed) return;
    if (!canAutoplayPreviewTrailer()) return;

    if (trailerTimerRef.current) window.clearTimeout(trailerTimerRef.current);
    trailerTimerRef.current = window.setTimeout(() => {
      // Re-check: tab might have gone hidden while waiting
      if (document.visibilityState !== 'visible') return;
      setShouldPlayTrailer(true);
    }, delayMs);
  };

  const onMouseEnter = () => {
    isHoveringRef.current = true;
    schedule();
  };

  const onMouseLeave = () => {
    isHoveringRef.current = false;
    stop();
  };

  const onIframeLoad = () => {
    // Some videos load an in-frame error UI (e.g. 153). Can't introspect cross-origin,
    // so fall back after a short delay ONLY if user is no longer hovering.
    if (trailerFailSafeRef.current) window.clearTimeout(trailerFailSafeRef.current);
    trailerFailSafeRef.current = window.setTimeout(() => {
      if (isHoveringRef.current) return;
      setTrailerFailed(true);
      setShouldPlayTrailer(false);
    }, 2500);
  };

  useEffect(() => {
    // Stop trailer immediately when tab becomes hidden
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset per-film trailer state
    setTrailerFailed(false);
    setShouldPlayTrailer(false);
    if (trailerTimerRef.current) {
      window.clearTimeout(trailerTimerRef.current);
      trailerTimerRef.current = null;
    }
    if (trailerFailSafeRef.current) {
      window.clearTimeout(trailerFailSafeRef.current);
      trailerFailSafeRef.current = null;
    }
  }, [trailerId]);

  return {
    shouldPlayTrailer,
    trailerFailed,
    onMouseEnter,
    onMouseLeave,
    onIframeLoad,
    stop,
  };
}
