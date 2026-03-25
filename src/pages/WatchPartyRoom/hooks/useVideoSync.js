import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { videoPlayerSelector } from "../../../redux/selectors";
import { setTimeVideo } from "../../../redux/slices/videoPlayerSlice";
import { updateVideoSync } from "../../../services/firebase/watchPartyService";

export function useVideoSync(roomId, isHost, isInitializing, roomDataStatus) {
  const dispatch = useDispatch();
  const videoPlayerState = useSelector(videoPlayerSelector);
  const { statusMovie, time, episode } = videoPlayerState;
  const { currentEpisode } = episode;

  // Giữ ref của time để tránh triggering effect liên tục khi time.currentTime đổi
  const timeRef = useRef(time.currentTime);
  useEffect(() => {
    timeRef.current = time.currentTime;
  }, [time.currentTime]);

  const syncTrigger = Math.floor(time.currentTime / 2);

  // Sync Video State (Host -> Firebase)
  useEffect(() => {
    if (isHost && !isInitializing) {
      const syncTimeout = setTimeout(() => {
        updateVideoSync(roomId, statusMovie.isPlay, timeRef.current, currentEpisode);
      }, 300); // Debounce to avoid spamming RTDB
      return () => clearTimeout(syncTimeout);
    }
  }, [isHost, statusMovie.isPlay, currentEpisode, syncTrigger, roomId, isInitializing]);

  // Auto Seek Late Joiner (Dùng Ref để tránh effect bị trigger liên tục khi guest xem phim)
  const guestTimeRef = useRef(time.currentTime);
  useEffect(() => {
    guestTimeRef.current = time.currentTime;
  }, [time.currentTime]);

  const roomDataCurrentTime = roomDataStatus?.currentTime;

  useEffect(() => {
    if (!isHost && roomDataCurrentTime !== undefined && isInitializing === false) {
       const timeDiff = Math.abs(guestTimeRef.current - roomDataCurrentTime);
       if (timeDiff > 3) {
           dispatch(setTimeVideo({ key: "currentTime", value: roomDataCurrentTime }));
       }
    }
  }, [roomDataCurrentTime, isHost, isInitializing, dispatch]);
}
