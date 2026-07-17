'use client';

import { useEffect, type MutableRefObject } from 'react';

import { setStatusMovie } from '../store/video-player-store';
import { useVideoPlayerStore } from '../store/video-player-store';

export function useVideoKeyboard(options: {
  isVideoFocusedRef: MutableRefObject<boolean>;
  isError: boolean;
  playbackLocked: boolean;
  handleTogglePlay: () => void;
  flashPlayPause: () => void;
  revealControls: () => void;
  applyDoubleTapSeek: (side: 'left' | 'right') => void;
  handleToggleFullScreen: () => void;
}) {
  const {
    isVideoFocusedRef,
    isError,
    playbackLocked,
    handleTogglePlay,
    flashPlayPause,
    revealControls,
    applyDoubleTapSeek,
    handleToggleFullScreen,
  } = options;

  const isMuted = useVideoPlayerStore((s) => s.statusMovie.isMuted);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playbackLocked || !isVideoFocusedRef.current || isError) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          handleTogglePlay();
          flashPlayPause();
          revealControls();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          applyDoubleTapSeek('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          applyDoubleTapSeek('right');
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFullScreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setStatusMovie({ key: 'isMuted', value: !isMuted });
          if (!isMuted) setStatusMovie({ key: 'currentVolume', value: 0 });
          else setStatusMovie({ key: 'currentVolume', value: 1 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isError,
    isMuted,
    playbackLocked,
    handleTogglePlay,
    applyDoubleTapSeek,
    handleToggleFullScreen,
    flashPlayPause,
    revealControls,
    isVideoFocusedRef,
  ]);
}
