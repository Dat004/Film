'use client';

import { useCallback, useEffect, useRef, type RefObject, type SyntheticEvent } from 'react';

import { ToastMessage } from '@/components/ui/Toastify';

import {
  PLAYBACK_DRIFT_SYNC_S,
  PLAYBACK_LOCKED_DRIFT_S,
  SEEK_CHANGE_DEBOUNCE_MS,
} from '../constants/playback.constants';
import { useVideoPlayerStore, setStatusMovie, setTimeVideo } from '../store/video-player-store';

/**
 * Keeps Zustand playback time/play/rate/volume in sync with the media element.
 */
export function useVideoPlaybackSync(options: {
  videoRef: RefObject<HTMLVideoElement | null>;
  playbackLocked: boolean;
  isError: boolean;
  changeTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  revealControls: () => void;
}) {
  const { videoRef, playbackLocked, isError, changeTimeoutRef, revealControls } = options;

  const isPlay = useVideoPlayerStore((s) => s.statusMovie.isPlay);
  const currentVolume = useVideoPlayerStore((s) => s.statusMovie.currentVolume);
  const playbackRate = useVideoPlayerStore((s) => s.statusMovie.playbackRate);
  const currentTime = useVideoPlayerStore((s) => s.time.currentTime);
  const currentEpisode = useVideoPlayerStore((s) => s.episode.currentEpisode);
  const srcEpoch = currentEpisode; // re-bind volume/rate on episode change
  const appliedPlayRef = useRef<{ isPlay: boolean; episode: number } | null>(null);
  // Avoid repeated autoplay-policy notifications.
  const lastBlockedToastRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(currentTime)) return;
    if (video.seeking) return;
    if (Math.abs(video.currentTime - currentTime) > PLAYBACK_DRIFT_SYNC_S) {
      try {
        video.currentTime = currentTime;
      } catch {
        /* HLS may reject */
      }
    }
  }, [currentTime, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prev = appliedPlayRef.current;
    if (prev?.isPlay === isPlay && prev.episode === currentEpisode) return;
    appliedPlayRef.current = { isPlay, episode: currentEpisode };

    if (isPlay) {
      void video.play().catch((err: unknown) => {
        // Keep store state aligned with the media element.
        appliedPlayRef.current = { isPlay: false, episode: currentEpisode };
        setStatusMovie({ key: 'isPlay', value: false });

        const isAutoPolicy =
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'AbortError');

        if (isAutoPolicy) {
          const now = Date.now();
          if (now - lastBlockedToastRef.current > 8000) {
            lastBlockedToastRef.current = now;
            ToastMessage.info('Trình duyệt chặn tự phát — bấm ▶ để xem');
          }
        }
      });
    } else {
      video.pause();
    }
  }, [isPlay, currentEpisode, videoRef]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = currentVolume;
    }
  }, [currentVolume, videoRef]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, srcEpoch, videoRef]);

  const handleTimeUpdate = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      const target = e.target as HTMLVideoElement;
      if (!videoRef.current || videoRef.current.readyState <= 3) return;

      if (playbackLocked) {
        if (target.seeking) return;
        const storeTime = useVideoPlayerStore.getState().time.currentTime;
        const drift = Math.abs(target.currentTime - storeTime);
        if (drift > PLAYBACK_LOCKED_DRIFT_S) {
          target.currentTime = storeTime;
          return;
        }
        if (isPlay) {
          setTimeVideo({ key: 'currentTime', value: target.currentTime });
        }
        return;
      }

      if (isPlay) {
        setTimeVideo({ key: 'currentTime', value: target.currentTime });
      }
    },
    [playbackLocked, isPlay, videoRef]
  );

  const handleChangeTime = useCallback(
    (_: unknown, currentTimeVideo: number) => {
      if (isError || playbackLocked) return;
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);

      setTimeVideo({ key: 'currentTime', value: currentTimeVideo });
      revealControls();
      setStatusMovie({ key: 'isPlay', value: false });

      changeTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTimeVideo;
        }
        setStatusMovie({ key: 'isPlay', value: true });
      }, SEEK_CHANGE_DEBOUNCE_MS);
    },
    [isError, playbackLocked, revealControls, changeTimeoutRef, videoRef]
  );

  const handleTogglePlay = useCallback(() => {
    if (!isError && !playbackLocked) setStatusMovie({ key: 'isPlay', value: !isPlay });
  }, [isError, isPlay, playbackLocked]);

  return {
    isPlay,
    currentTime,
    handleTimeUpdate,
    handleChangeTime,
    handleTogglePlay,
  };
}
