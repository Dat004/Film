import { useEffect, useRef, useState } from 'react';

import { useVideoPlayerStore, setTimeVideo, setStatusMovie } from '@/features/player';
import { getServerTimeOffset } from '@/services/firebase-client';

import { SYNC_DEBOUNCE_MS } from '../constants/watch-party.constants';
import { updateVideoSync } from '../services/watch-party.service';
import type { RoomStatus } from '../types/watch-party.types';

const HARD_SEEK_THRESHOLD_SEC = 1.2;
const PROPORTIONAL_GAIN_KP = 0.25;
const MIN_ADAPTIVE_RATE = 0.85;
const MAX_ADAPTIVE_RATE = 1.2;
const SYNC_LOOP_INTERVAL_MS = 400;

export function estimateHostTime(status: RoomStatus): number {
  const base = status.currentTime ?? 0;
  if (!status.isPlaying || !status.updatedAt) return base;
  const globalNow = Date.now() + getServerTimeOffset();
  const hostRate = status.playbackRate ?? 1.0;
  const elapsed = Math.max(0, (globalNow - status.updatedAt) / 1000);
  // Cap elapsed time to 10 seconds to prevent huge jump on stale status
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

  useEffect(() => {
    timeRef.current = time.currentTime;
  }, [time.currentTime]);

  // Detect intentional host seeks (±2.5s / scrub) beyond normal playback drift
  useEffect(() => {
    if (!isHost) return;
    const delta = Math.abs(time.currentTime - lastHostTimeRef.current);
    lastHostTimeRef.current = time.currentTime;
    if (delta >= 2.5) {
      setSeekSeq((s) => s + 1);
    }
  }, [time.currentTime, isHost]);

  const syncTrigger = Math.round(time.currentTime * 2);

  // Host -> Firebase only (rules also enforce host-only status writes)
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

    // Immediately sync Play / Pause state with Host
    if (typeof roomDataStatus.isPlaying === 'boolean') {
      const currentIsPlay = useVideoPlayerStore.getState().statusMovie.isPlay;
      if (currentIsPlay !== roomDataStatus.isPlaying) {
        setStatusMovie({ key: 'isPlay', value: roomDataStatus.isPlaying });
        // If Host paused, immediately align guest currentTime with Host's pause point
        if (!roomDataStatus.isPlaying && roomDataStatus.currentTime !== undefined) {
          setTimeVideo({ key: 'currentTime', value: roomDataStatus.currentTime });
        }
      }
    }

    if (roomDataStatus.currentTime === undefined) return;

    const baseHostRate = roomDataStatus.playbackRate ?? 1.0;
    const seekSeqRemote = roomDataStatus.seekSeq;
    const forcedSeek =
      typeof seekSeqRemote === 'number' && seekSeqRemote !== lastAppliedSeekSeqRef.current;

    const targetTime = forcedSeek ? roomDataStatus.currentTime : estimateHostTime(roomDataStatus);
    const deltaT = timeRef.current - targetTime; // >0 means guest ahead, <0 means guest behind
    const absDrift = Math.abs(deltaT);

    if (forcedSeek || absDrift > HARD_SEEK_THRESHOLD_SEC) {
      setTimeVideo({ key: 'currentTime', value: targetTime });
      setStatusMovie({ key: 'playbackRate', value: baseHostRate });
      if (typeof seekSeqRemote === 'number') {
        lastAppliedSeekSeqRef.current = seekSeqRemote;
      }
    } else if (absDrift > 0.15) {
      const targetRate = Math.min(
        Math.max(baseHostRate - PROPORTIONAL_GAIN_KP * deltaT, MIN_ADAPTIVE_RATE),
        MAX_ADAPTIVE_RATE
      );
      setStatusMovie({ key: 'playbackRate', value: Math.round(targetRate * 100) / 100 });
    } else {
      setStatusMovie({ key: 'playbackRate', value: baseHostRate });
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

  // Guest: Continuous micro-sync ticker (400ms)
  useEffect(() => {
    if (isHost || isInitializing || !roomDataStatus) return;

    const interval = setInterval(() => {
      if (roomDataStatus.currentTime === undefined || !roomDataStatus.isPlaying) return;

      const baseHostRate = roomDataStatus.playbackRate ?? 1.0;
      const targetTime = estimateHostTime(roomDataStatus);
      const deltaT = timeRef.current - targetTime;
      const absDrift = Math.abs(deltaT);

      if (absDrift > HARD_SEEK_THRESHOLD_SEC) {
        setTimeVideo({ key: 'currentTime', value: targetTime });
        setStatusMovie({ key: 'playbackRate', value: baseHostRate });
      } else if (absDrift > 0.15) {
        const targetRate = Math.min(
          Math.max(baseHostRate - PROPORTIONAL_GAIN_KP * deltaT, MIN_ADAPTIVE_RATE),
          MAX_ADAPTIVE_RATE
        );
        setStatusMovie({ key: 'playbackRate', value: Math.round(targetRate * 100) / 100 });
      } else {
        setStatusMovie({ key: 'playbackRate', value: baseHostRate });
      }
    }, SYNC_LOOP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isHost, isInitializing, roomDataStatus]);
}

export default useVideoSync;

