'use client';

import { useEffect, type MutableRefObject } from 'react';

import { setStatusMovie, setTimeVideo } from '../store/video-player-store';
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
  onToggleShortcutsModal?: () => void;
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
    onToggleShortcutsModal,
  } = options;

  const isMuted = useVideoPlayerStore((s) => s.statusMovie.isMuted);
  const currentVolume = useVideoPlayerStore((s) => s.statusMovie.currentVolume);
  const duration = useVideoPlayerStore((s) => s.time.duration);

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
          revealControls();
          break;

        case 'ArrowRight':
          e.preventDefault();
          applyDoubleTapSeek('right');
          revealControls();
          break;

        case 'j':
        case 'J':
          e.preventDefault();
          applyDoubleTapSeek('left');
          applyDoubleTapSeek('left');
          revealControls();
          break;

        case 'l':
        case 'L':
          e.preventDefault();
          applyDoubleTapSeek('right');
          applyDoubleTapSeek('right');
          revealControls();
          break;

        case 'ArrowUp': {
          e.preventDefault();
          const nextVol = Math.min(1, currentVolume + 0.1);
          setStatusMovie({ key: 'currentVolume', value: nextVol });
          if (nextVol > 0 && isMuted) {
            setStatusMovie({ key: 'isMuted', value: false });
          }
          revealControls();
          break;
        }

        case 'ArrowDown': {
          e.preventDefault();
          const nextVol = Math.max(0, currentVolume - 0.1);
          setStatusMovie({ key: 'currentVolume', value: nextVol });
          if (nextVol === 0 && !isMuted) {
            setStatusMovie({ key: 'isMuted', value: true });
          }
          revealControls();
          break;
        }

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
          revealControls();
          break;

        case '?':
          e.preventDefault();
          onToggleShortcutsModal?.();
          revealControls();
          break;

        default: {
          // Number keys 0-9 to jump to 0%-90% of duration
          if (/^[0-9]$/.test(e.key) && duration > 0) {
            e.preventDefault();
            const percent = parseInt(e.key, 10) * 0.1;
            setTimeVideo({ key: 'currentTime', value: duration * percent });
            revealControls();
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isError,
    isMuted,
    currentVolume,
    duration,
    playbackLocked,
    handleTogglePlay,
    applyDoubleTapSeek,
    handleToggleFullScreen,
    flashPlayPause,
    revealControls,
    onToggleShortcutsModal,
    isVideoFocusedRef,
  ]);
}
