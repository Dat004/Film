"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { updateVideoSync } from "@/features/watch-party/services/watch-party-service";

export function useVideoSync(
  roomId: string,
  isHost: boolean,
  isInitializing: boolean,
  roomDataStatus: any
) {
  const currentTime = usePlayerStore((state) => state.time.currentTime);
  const isPlay = usePlayerStore((state) => state.isPlay);
  const currentEpisode = usePlayerStore((state) => state.episode.currentEpisode);
  const setTimeVideo = usePlayerStore((state) => state.setTimeVideo);

  // Keep ref of time to avoid triggering effect continuously on every currentTime change
  const timeRef = React.useRef(currentTime);
  React.useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  const syncTrigger = Math.floor(currentTime / 2);

  // Sync Video State (Host -> Firebase)
  React.useEffect(() => {
    if (isHost && !isInitializing) {
      const syncTimeout = setTimeout(() => {
        updateVideoSync(roomId, isPlay, timeRef.current, currentEpisode);
      }, 300); // Debounce to avoid spamming RTDB
      return () => clearTimeout(syncTimeout);
    }
  }, [isHost, isPlay, currentEpisode, syncTrigger, roomId, isInitializing]);

  // Auto Seek Late Joiner (Use Ref to avoid loop trigger as guest watches)
  const guestTimeRef = React.useRef(currentTime);
  React.useEffect(() => {
    guestTimeRef.current = currentTime;
  }, [currentTime]);

  const roomDataCurrentTime = roomDataStatus?.currentTime;

  React.useEffect(() => {
    if (!isHost && roomDataCurrentTime !== undefined && isInitializing === false) {
      const timeDiff = Math.abs(guestTimeRef.current - roomDataCurrentTime);
      if (timeDiff > 3) {
        setTimeVideo("currentTime", roomDataCurrentTime);
      }
    }
  }, [roomDataCurrentTime, isHost, isInitializing, setTimeVideo]);
}

export default useVideoSync;
