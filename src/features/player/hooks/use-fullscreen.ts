import * as React from "react";
import { usePlayerStore } from "../stores/player-store";

export function useFullscreen(
  wrapperRef: React.RefObject<HTMLDivElement>,
  videoRef: React.RefObject<HTMLVideoElement>
) {
  const isFullScreen = usePlayerStore((state) => state.isFullScreen);
  const setIsPlay = usePlayerStore((state) => state.setIsPlay);
  const setIsFullScreen = usePlayerStore((state) => state.setIsFullScreen);
  const setIsMuted = usePlayerStore((state) => state.setIsMuted);
  const setCurrentVolume = usePlayerStore((state) => state.setCurrentVolume);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);

  const enterFullScreen = React.useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (wrapper.requestFullscreen) {
      wrapper.requestFullscreen();
    } else if ((wrapper as any).webkitEnterFullscreen) {
      (wrapper as any).webkitEnterFullscreen();
    } else if ((wrapper as any).mozRequestFullScreen) {
      (wrapper as any).mozRequestFullScreen();
    } else if ((wrapper as any).webkitRequestFullscreen) {
      (wrapper as any).webkitRequestFullscreen();
    } else if ((wrapper as any).msRequestFullscreen) {
      (wrapper as any).msRequestFullscreen();
    } else if (videoRef.current && (videoRef.current as any).webkitSupportsFullscreen) {
      (videoRef.current as any).webkitEnterFullscreen();
    }
  }, [wrapperRef, videoRef]);

  const exitFullScreen = React.useCallback(() => {
    const doc = document as any;
    if (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, []);

  const handleToggleFullScreen = React.useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen, setIsPlay]);

  React.useEffect(() => {
    const handleFullScreenChange = () => {
      const doc = document as any;
      const isCurrentlyFull = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        (videoRef.current && (videoRef.current as any).webkitDisplayingFullscreen)
      );
      setIsFullScreen(isCurrentlyFull);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.keyCode === 122) {
        e.preventDefault();
        handleToggleFullScreen();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullScreenChange);
    };
  }, [isFullScreen, setIsPlay, handleToggleFullScreen, videoRef]);

  React.useEffect(() => {
    if (isFullScreen) {
      enterFullScreen();
    } else {
      exitFullScreen();
    }
  }, [isFullScreen, enterFullScreen, exitFullScreen]);

  return { handleToggleFullScreen };
}
