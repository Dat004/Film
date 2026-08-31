import { useEffect, useRef, useState } from 'react';

import { useVideoPlayerStore, setTimeVideo, setStatusMovie } from '@/features/player';
import { getServerTimeOffset } from '@/services/firebase-client';

import { SYNC_DEBOUNCE_MS } from '../constants/watch-party.constants';
import { updateVideoSync } from '../services/watch-party.service';
import type { RoomStatus } from '../types/watch-party.types';

const HARD_SEEK_THRESHOLD_SEC = 1.2;
const MICRO_SYNC_DRIFT_SEC = 0.25;
const PROPORTIONAL_GAIN_KP = 0.25;
const MIN_ADAPTIVE_RATE = 0.85;
const MAX_ADAPTIVE_RATE = 1.2;
const SYNC_LOOP_INTERVAL_MS = 750;

/** Cooldown (ms) after hard-seek to let video settle. */
const HARD_SEEK_COOLDOWN_MS = 1800;

export function estimateHostTime(status: RoomStatus): number {
  const base = status.currentTime ?? 0;
  if (!status.isPlaying || !status.updatedAt) return base;
  const globalNow = Date.now() + getServerTimeOffset();
  const hostRate = status.playbackRate ?? 1.0;
  const elapsed = Math.max(0, (globalNow - status.updatedAt) / 1000);
  return base + Math.min(elapsed, 10) * hostRate;
}

export function useVideoSync(
  roomId: string,
  isHost: boolean,
  isInitializing: boolean,
  roomDataStatus: RoomStatus | undefined | null
) {
  const videoPlayerState = useVideoPlayerStore((state) => state);
  const { statusMovie, time, episode } = videoPlayerState;
  const { currentEpisode } = episode;

  const timeRef = useRef(time.currentTime);
  const lastHostTimeRef = useRef(time.currentTime);
  const lastAppliedSeekSeqRef = useRef<number | null>(null);
  const [seekSeq, setSeekSeq] = useState(0);

  const lastHardSeekTsRef = useRef(0);
  const roomDataStatusRef = useRef(roomDataStatus);
  useEffect(() => {
    roomDataStatusRef.current = roomDataStatus;
  }, [roomDataStatus]);

  // Monotonic host time anchor to eliminate clock-skew and network-jitter sawtooth jumps
  const hostAnchorRef = useRef<{
    hostTime: number;
    localTs: number;
    rate: number;
  }>({
    hostTime: 0,
    localTs: 0,
    rate: 1.0,
  });

  // Calculate monotonic estimated host time using performance.now()
  const getMonotonicHostTime = (status: RoomStatus): number => {
    if (!status.isPlaying) return status.currentTime ?? 0;
    const anchor = hostAnchorRef.current;
    if (anchor.localTs === 0) return status.currentTime ?? 0;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = Math.max(0, (now - anchor.localTs) / 1000);
    return anchor.hostTime + elapsed * anchor.rate;
  };

  // Execute hard seek on both native <video> element and Zustand store synchronously
  const executeHardSeek = (targetTime: number, baseHostRate: number) => {
    if (typeof document !== 'undefined') {
      const video = document.querySelector('video') as HTMLVideoElement | null;
      if (video && Math.abs(video.currentTime - targetTime) > 0.1) {
        try {
          video.currentTime = targetTime;
        } catch {}
      }
    }
    setTimeVideo({ key: 'currentTime', value: targetTime });
    setStatusMovie({ key: 'playbackRate', value: baseHostRate });
    timeRef.current = targetTime;
    lastHardSeekTsRef.current = Date.now();
  };

  // Update monotonic anchor whenever roomDataStatus changes
  useEffect(() => {
    if (isHost || !roomDataStatus || roomDataStatus.currentTime === undefined) return;

    const baseHostRate = roomDataStatus.playbackRate ?? 1.0;
    const newHostTime = roomDataStatus.currentTime;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const seekSeqRemote = roomDataStatus.seekSeq;
    const forcedSeek =
      typeof seekSeqRemote === 'number' && seekSeqRemote !== lastAppliedSeekSeqRef.current;

    if (!roomDataStatus.isPlaying) {
      hostAnchorRef.current = {
        hostTime: newHostTime,
        localTs: now,
        rate: baseHostRate,
      };
      return;
    }

    const prevAnchor = hostAnchorRef.current;
    const currentEstimate =
      prevAnchor.localTs > 0
        ? prevAnchor.hostTime + ((now - prevAnchor.localTs) / 1000) * prevAnchor.rate
        : 0;

    // Only update anchor if forced seek, or explicit host jump (> 2s), or monotonic progress.
    if (
      forcedSeek ||
      prevAnchor.localTs === 0 ||
      Math.abs(newHostTime - currentEstimate) > 2.0 ||
      newHostTime > currentEstimate
    ) {
      hostAnchorRef.current = {
        hostTime: newHostTime,
        localTs: now,
        rate: baseHostRate,
      };
    }
  }, [
    isHost,
    roomDataStatus?.currentTime,
    roomDataStatus?.updatedAt,
    roomDataStatus?.isPlaying,
    roomDataStatus?.playbackRate,
    roomDataStatus?.seekSeq,
  ]);

  useEffect(() => {
    timeRef.current = time.currentTime;
  }, [time.currentTime]);

  // Host: Detect intentional seeks (±2.5s / scrub) beyond normal playback drift
  useEffect(() => {
    if (!isHost) return;
    const delta = Math.abs(time.currentTime - lastHostTimeRef.current);
    lastHostTimeRef.current = time.currentTime;
    if (delta >= 2.5) {
      setSeekSeq((s) => s + 1);
    }
  }, [time.currentTime, isHost]);

  const syncTrigger = Math.round(time.currentTime * 2);

  // Host -> Firebase only (rules enforce host-only writes)
  useEffect(() => {
    if (!isHost || isInitializing) return;

    const delay = seekSeq > 0 ? Math.min(SYNC_DEBOUNCE_MS, 150) : SYNC_DEBOUNCE_MS;
    const syncTimeout = setTimeout(() => {
      void updateVideoSync(roomId, {
        isPlaying: statusMovie.isPlay,
        currentTime: timeRef.current,
        currentEpisode,
        playbackRate: statusMovie.playbackRate,
        autoPlay: statusMovie.autoPlay,
        autoNext: statusMovie.autoNext,
        seekSeq,
      });
    }, delay);

    return () => clearTimeout(syncTimeout);
  }, [
    isHost,
    statusMovie.isPlay,
    statusMovie.playbackRate,
    statusMovie.autoPlay,
    statusMovie.autoNext,
    currentEpisode,
    syncTrigger,
    seekSeq,
    roomId,
    isInitializing,
  ]);

  // Guest: Synchronize Play/Pause state & Proportional Control Sync Engine
  useEffect(() => {
    if (isHost || isInitializing || !roomDataStatus) return;

    if (typeof roomDataStatus.autoPlay === 'boolean') {
      setStatusMovie({ key: 'autoPlay', value: roomDataStatus.autoPlay });
    }
    if (typeof roomDataStatus.autoNext === 'boolean') {
      setStatusMovie({ key: 'autoNext', value: roomDataStatus.autoNext });
    }

    if (typeof roomDataStatus.isPlaying === 'boolean') {
      const currentIsPlay = useVideoPlayerStore.getState().statusMovie.isPlay;
      if (currentIsPlay !== roomDataStatus.isPlaying) {
        setStatusMovie({ key: 'isPlay', value: roomDataStatus.isPlaying });
        if (!roomDataStatus.isPlaying && roomDataStatus.currentTime !== undefined) {
          executeHardSeek(roomDataStatus.currentTime, roomDataStatus.playbackRate ?? 1.0);
        }
      }
    }

    if (roomDataStatus.currentTime === undefined) return;

    const baseHostRate = roomDataStatus.playbackRate ?? 1.0;
    const seekSeqRemote = roomDataStatus.seekSeq;
    const forcedSeek =
      typeof seekSeqRemote === 'number' && seekSeqRemote !== lastAppliedSeekSeqRef.current;

    const targetTime = forcedSeek
      ? roomDataStatus.currentTime
      : getMonotonicHostTime(roomDataStatus);
    const deltaT = timeRef.current - targetTime;
    const absDrift = Math.abs(deltaT);

    const inCooldown =
      !forcedSeek && Date.now() - lastHardSeekTsRef.current < HARD_SEEK_COOLDOWN_MS;

    if (forcedSeek || (!inCooldown && absDrift > HARD_SEEK_THRESHOLD_SEC)) {
      executeHardSeek(targetTime, baseHostRate);
      if (typeof seekSeqRemote === 'number') {
        lastAppliedSeekSeqRef.current = seekSeqRemote;
      }
    } else if (absDrift > MICRO_SYNC_DRIFT_SEC) {
      const targetRate = Math.min(
        Math.max(baseHostRate - PROPORTIONAL_GAIN_KP * deltaT, MIN_ADAPTIVE_RATE),
        MAX_ADAPTIVE_RATE
      );
      const rounded = Math.round(targetRate * 100) / 100;
      const currentRate = useVideoPlayerStore.getState().statusMovie.playbackRate;
      if (rounded !== currentRate) {
        setStatusMovie({ key: 'playbackRate', value: rounded });
      }
    } else {
      const currentRate = useVideoPlayerStore.getState().statusMovie.playbackRate;
      if (currentRate !== baseHostRate) {
        setStatusMovie({ key: 'playbackRate', value: baseHostRate });
      }
    }
  }, [
    isHost,
    isInitializing,
    roomDataStatus?.currentTime,
    roomDataStatus?.seekSeq,
    roomDataStatus?.playbackRate,
    roomDataStatus?.autoPlay,
    roomDataStatus?.autoNext,
    roomDataStatus?.updatedAt,
    roomDataStatus?.isPlaying,
  ]);

  // Guest: Continuous micro-sync ticker (750ms)
  useEffect(() => {
    if (isHost || isInitializing || !roomDataStatus) return;

    const interval = setInterval(() => {
      const status = roomDataStatusRef.current;
      if (!status || status.currentTime === undefined || !status.isPlaying) return;

      if (Date.now() - lastHardSeekTsRef.current < HARD_SEEK_COOLDOWN_MS) return;

      const baseHostRate = status.playbackRate ?? 1.0;
      const targetTime = getMonotonicHostTime(status);
      const deltaT = timeRef.current - targetTime;
      const absDrift = Math.abs(deltaT);

      if (absDrift > HARD_SEEK_THRESHOLD_SEC) {
        executeHardSeek(targetTime, baseHostRate);
      } else if (absDrift > MICRO_SYNC_DRIFT_SEC) {
        const targetRate = Math.min(
          Math.max(baseHostRate - PROPORTIONAL_GAIN_KP * deltaT, MIN_ADAPTIVE_RATE),
          MAX_ADAPTIVE_RATE
        );
        const rounded = Math.round(targetRate * 100) / 100;
        const currentRate = useVideoPlayerStore.getState().statusMovie.playbackRate;
        if (rounded !== currentRate) {
          setStatusMovie({ key: 'playbackRate', value: rounded });
        }
      } else {
        const currentRate = useVideoPlayerStore.getState().statusMovie.playbackRate;
        if (currentRate !== baseHostRate) {
          setStatusMovie({ key: 'playbackRate', value: baseHostRate });
        }
      }
    }, SYNC_LOOP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isHost, isInitializing, roomDataStatus]);
}

export default useVideoSync;
