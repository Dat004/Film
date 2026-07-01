import * as React from "react";
import Hls from "hls.js";
import { usePlayerStore } from "../stores/player-store";

interface UseHlsPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string;
  onCanPlay?: () => void;
  onError?: (message: string) => void;
}

export function useHlsPlayer({
  videoRef,
  src,
  onCanPlay = () => {},
  onError = () => {},
}: UseHlsPlayerProps) {
  const isPlay = usePlayerStore((state) => state.isPlay);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const currentVolume = usePlayerStore((state) => state.currentVolume);
  const currentTime = usePlayerStore((state) => state.time.currentTime);
  const currentEpisode = usePlayerStore((state) => state.episode.currentEpisode);
  
  const setIsPlay = usePlayerStore((state) => state.setIsPlay);
  const setIsFullScreen = usePlayerStore((state) => state.setIsFullScreen);
  const setIsMuted = usePlayerStore((state) => state.setIsMuted);
  const setCurrentVolume = usePlayerStore((state) => state.setCurrentVolume);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);
  const setTimeVideo = usePlayerStore((state) => state.setTimeVideo);

  const lastTimeRef = React.useRef(0);

  // 1. Initial metadata loaded & Native HLS handles
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const config = {
      maxBufferLength: 60,
      maxMaxBufferLength: 1200,
      backBufferLength: Infinity,
      frontBufferFlushThreshold: Infinity,
      maxBufferSize: 120 * 1000 * 1000,
      maxBufferHole: 0.1,
    };

    let hls: Hls | null = null;
    let usedNativeHls = false;

    const onNativeLoadedMetadata = () => {
      onCanPlay();
    };

    if (Hls.isSupported()) {
      hls = new Hls(config);
      hls.attachMedia(video);
      hls.loadSource(src);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              onError("Gặp lỗi mạng nghiêm trọng, hãy thử khôi phục");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              onError("Gặp lỗi phương tiện nghiêm trọng, hãy thử khôi phục");
              break;
            default:
              if (hls) hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      usedNativeHls = true;
      video.src = src;
      video.addEventListener("loadedmetadata", onNativeLoadedMetadata);
    } else {
      onError("Thiết bị này không hỗ trợ định dạng HLS.");
    }

    return () => {
      if (usedNativeHls) {
        video.removeEventListener("loadedmetadata", onNativeLoadedMetadata);
        video.removeAttribute("src");
        video.load();
      }
      if (hls) {
        hls.detachMedia();
        hls.destroy();
      }
      setTimeVideo("currentTime", 0);
      setTimeVideo("duration", 0);
    };
  }, [src, videoRef, onCanPlay, onError, setTimeVideo]);

  // 2. Resume Watching handler (Loaded Metadata seeks)
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      if (currentTime > 0) {
        video.currentTime = currentTime;
        lastTimeRef.current = currentTime;
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedData);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedData);
    };
  }, [videoRef]);

  // 3. Playback trigger
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {}).catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isPlay, currentEpisode, videoRef]);

  // 4. Volume trigger
  React.useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = currentVolume;
    }
  }, [currentVolume, videoRef]);

  // 5. Throttled time update (Task 5.1: 1.5 seconds intervals check)
  const handleTimeUpdate = React.useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.target as HTMLVideoElement;
      if (video.readyState > 3 && isPlay) {
        const time = video.currentTime;
        // Update store only if elapsed time is >= 1.5 seconds, or if seeked/paused
        if (Math.abs(time - lastTimeRef.current) >= 1.5) {
          lastTimeRef.current = time;
          setTimeVideo("currentTime", time);
        }
      }
    },
    [isPlay, setTimeVideo]
  );

  // Immediate sync when seeking completes
  const syncTimeOnSeek = React.useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = time;
        lastTimeRef.current = time;
        setTimeVideo("currentTime", time);
      }
    },
    [videoRef, setTimeVideo]
  );

  return { handleTimeUpdate, syncTimeOnSeek };
}
