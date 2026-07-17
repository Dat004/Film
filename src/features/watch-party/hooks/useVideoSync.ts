import { useEffect, useRef, useState } from 'react';

import { useVideoPlayerStore, setTimeVideo, setStatusMovie } from '@/features/player';

import { SYNC_DEBOUNCE_MS } from '../constants/watch-party.constants';
import { updateVideoSync } from '../services/watch-party.service';
import type { RoomStatus } from '../types/watch-party.types';

const DRIFT_THRESHOLD_SEC = 1.0;
const DRIFT_CHECK_INTERVAL_MS = 2000;

function estimateHostTime(status: RoomStatus): number {
  const base = status.currentTime ?? 0;
  if (!status.isPlaying || !status.updatedAt) return base;
  const elapsed = Math.max(0, (Date.now() - status.updatedAt) / 1000);
  // Cap catch-up so a stale updatedAt cannot jump too far
  return base + Math.min(elapsed, 3);
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

  // Detect intentional host seeks (±10s / scrub) beyond normal playback drift
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

  // Guest: apply host playback prefs + hard seek on seekSeq / large drift
  useEffect(() => {
    if (isHost || isInitializing || !roomDataStatus) return;

    if (typeof roomDataStatus.playbackRate === 'number') {
      setStatusMovie({ key: 'playbackRate', value: roomDataStatus.playbackRate });
    }
    if (typeof roomDataStatus.autoPlay === 'boolean') {
      setStatusMovie({ key: 'autoPlay', value: roomDataStatus.autoPlay });
    }
    if (typeof roomDataStatus.autoNext === 'boolean') {
      setStatusMovie({ key: 'autoNext', value: roomDataStatus.autoNext });
    }

    if (roomDataStatus.currentTime === undefined) return;

    const seekSeqRemote = roomDataStatus.seekSeq;
    const forcedSeek =
      typeof seekSeqRemote === 'number' && seekSeqRemote !== lastAppliedSeekSeqRef.current;

    const targetTime = forcedSeek ? roomDataStatus.currentTime : estimateHostTime(roomDataStatus);

    const timeDiff = Math.abs(timeRef.current - targetTime);
    if (forcedSeek || timeDiff > DRIFT_THRESHOLD_SEC) {
      setTimeVideo({ key: 'currentTime', value: targetTime });
      if (typeof seekSeqRemote === 'number') {
        lastAppliedSeekSeqRef.current = seekSeqRemote;
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

  // Guest: keep locking to estimated host timeline
  useEffect(() => {
    if (isHost || isInitializing || !roomDataStatus) return;

    const interval = setInterval(() => {
      if (roomDataStatus.currentTime === undefined) return;
      const target = estimateHostTime(roomDataStatus);
      const timeDiff = Math.abs(timeRef.current - target);
      if (timeDiff > DRIFT_THRESHOLD_SEC) {
        setTimeVideo({ key: 'currentTime', value: target });
      }
    }, DRIFT_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isHost, isInitializing, roomDataStatus]);
}

export default useVideoSync;
