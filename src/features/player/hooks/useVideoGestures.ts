'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';

import {
  DOUBLE_TAP_MS,
  PLAY_FLASH_MS,
  SEEK_STACK_MS,
  SEEK_STEP_S,
} from '../constants/playback.constants';
import { setTimeVideo } from '../store/video-player-store';

export type GestureZone = 'left' | 'center' | 'right';
export type SeekRipple = { id: number; x: number; y: number };
export type SeekLabel = { side: 'left' | 'right'; seconds: number };

export function useVideoGestures(options: {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoWrapperRef: RefObject<HTMLDivElement | null>;
  duration: number;
  isError: boolean;
  playbackLocked: boolean;
  handleTogglePlay: () => void;
  revealControls: () => void;
}) {
  const {
    videoRef,
    videoWrapperRef,
    duration,
    isError,
    playbackLocked,
    handleTogglePlay,
    revealControls,
  } = options;

  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ zone: GestureZone; at: number } | null>(null);
  const seekStackRef = useRef<{ side: 'left' | 'right'; at: number; seconds: number } | null>(null);

  const [playFlash, setPlayFlash] = useState(false);
  const [seekRipples, setSeekRipples] = useState<SeekRipple[]>([]);
  const [seekLabel, setSeekLabel] = useState<SeekLabel | null>(null);

  const flashPlayPause = useCallback(() => {
    setPlayFlash(true);
    window.setTimeout(() => setPlayFlash(false), PLAY_FLASH_MS);
  }, []);

  const handleSeekRelative = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video || isError || playbackLocked) return;
      const max = video.duration || duration || 0;
      const next = Math.max(0, Math.min(max, video.currentTime + seconds));
      video.currentTime = next;
      setTimeVideo({ key: 'currentTime', value: next });
    },
    [isError, duration, playbackLocked, videoRef]
  );

  const flashSeek = useCallback(
    (side: 'left' | 'right', point?: { x: number; y: number }) => {
      const now = Date.now();
      const prev = seekStackRef.current;
      const stacked =
        prev != null && prev.side === side && now - prev.at < SEEK_STACK_MS
          ? prev.seconds + SEEK_STEP_S
          : SEEK_STEP_S;

      const wrapRect = videoWrapperRef.current?.getBoundingClientRect();
      let localX = wrapRect ? wrapRect.width * (side === 'left' ? 0.22 : 0.78) : 120;
      let localY = wrapRect ? wrapRect.height * 0.5 : 120;

      if (point && wrapRect) {
        localX = Math.max(24, Math.min(wrapRect.width - 24, point.x - wrapRect.left));
        localY = Math.max(24, Math.min(wrapRect.height - 24, point.y - wrapRect.top));
      }

      seekStackRef.current = { side, at: now, seconds: stacked };
      setSeekLabel({ side, seconds: stacked });
      setSeekRipples((list) => [...list, { id: now, x: localX, y: localY }]);

      if (seekFlashTimeoutRef.current) clearTimeout(seekFlashTimeoutRef.current);
      seekFlashTimeoutRef.current = setTimeout(() => {
        setSeekLabel(null);
        seekStackRef.current = null;
        seekFlashTimeoutRef.current = null;
      }, SEEK_STACK_MS);
    },
    [videoWrapperRef]
  );

  const applyDoubleTapSeek = useCallback(
    (side: 'left' | 'right', point?: { x: number; y: number }) => {
      if (playbackLocked) return;
      handleSeekRelative(side === 'left' ? -SEEK_STEP_S : SEEK_STEP_S);
      flashSeek(side, point);
    },
    [playbackLocked, handleSeekRelative, flashSeek]
  );

  const runSingleTap = useCallback(
    (pointerType: string, _zone: GestureZone) => {
      if (pointerType === 'touch' || pointerType === 'pen') {
        if (!playbackLocked) {
          handleTogglePlay();
          flashPlayPause();
        }
        revealControls();
        return;
      }

      if (!playbackLocked) {
        handleTogglePlay();
        flashPlayPause();
      }
      revealControls();
    },
    [revealControls, handleTogglePlay, flashPlayPause, playbackLocked]
  );

  const handleZonePointerUp = useCallback(
    (zone: GestureZone, pointerType: string, point: { x: number; y: number }) => {
      if (isError) return;

      const now = Date.now();
      const last = lastTapRef.current;
      const isDouble = last != null && last.zone === zone && now - last.at < DOUBLE_TAP_MS;

      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }

      if (isDouble && zone !== 'center') {
        lastTapRef.current = null;
        applyDoubleTapSeek(zone, point);
        return;
      }

      if (isDouble && zone === 'center') {
        lastTapRef.current = null;
        return;
      }

      lastTapRef.current = { zone, at: now };

      if (zone === 'center') {
        runSingleTap(pointerType, zone);
        return;
      }

      singleTapTimeoutRef.current = setTimeout(() => {
        singleTapTimeoutRef.current = null;
        if (lastTapRef.current?.at !== now) return;
        lastTapRef.current = null;
        runSingleTap(pointerType, zone);
      }, DOUBLE_TAP_MS);
    },
    [isError, applyDoubleTapSeek, runSingleTap]
  );

  const cleanupGestures = useCallback(() => {
    if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
    if (seekFlashTimeoutRef.current) clearTimeout(seekFlashTimeoutRef.current);
  }, []);

  return {
    playFlash,
    seekRipples,
    setSeekRipples,
    seekLabel,
    flashPlayPause,
    applyDoubleTapSeek,
    handleZonePointerUp,
    cleanupGestures,
  };
}
