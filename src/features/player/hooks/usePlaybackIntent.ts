'use client';

import { useCallback, useEffect, useRef } from 'react';

import { setStatusMovie } from '../store/video-player-store';

export type PlayReason = 'user' | 'autoplay' | 'auto-next' | 'resume';

interface UsePlaybackIntentOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Guests cannot control playback in a watch party. */
  playbackLocked: boolean;
  setShowPoster: (show: boolean) => void;
}

export function usePlaybackIntent({
  videoRef,
  playbackLocked,
  setShowPoster,
}: UsePlaybackIntentOptions) {
  const pendingReasonRef = useRef<PlayReason | null>(null);

  const commitPlay = useCallback(
    (reason: PlayReason) => {
      setShowPoster(false);
      setStatusMovie({ key: 'isPlay', value: true });
      pendingReasonRef.current = null;
      void reason;
    },
    [setShowPoster]
  );

  const requestPlay = useCallback(
    (reason: PlayReason) => {
      if (playbackLocked) return;

      const video = videoRef.current;
      // HAVE_FUTURE_DATA
      const ready = video && video.readyState >= 3;

      if (!ready) {
        pendingReasonRef.current = reason;
        if (reason === 'user') {
          // Preserve the user gesture while the stream initializes.
          setShowPoster(false);
        }
        return;
      }

      commitPlay(reason);
    },
    [playbackLocked, videoRef, setShowPoster, commitPlay]
  );

  const requestPause = useCallback(() => {
    pendingReasonRef.current = null;
    setStatusMovie({ key: 'isPlay', value: false });
  }, []);

  const onMediaReady = useCallback(() => {
    const pending = pendingReasonRef.current;
    if (!pending || playbackLocked) return;
    commitPlay(pending);
  }, [commitPlay, playbackLocked]);

  useEffect(() => {
    if (!pendingReasonRef.current || playbackLocked) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 3) {
      commitPlay(pendingReasonRef.current);
    }
  });

  return { requestPlay, requestPause, onMediaReady };
}
