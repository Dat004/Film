"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { IoPause, IoPlay } from "react-icons/io5";

import BarControls from "./bar-controls";
import { PlayDisabled } from "@/icons";
import { usePlayerStore } from "../stores/player-store";
import { useFullscreen } from "../hooks/use-fullscreen";
import { useHlsPlayer } from "../hooks/use-hls-player";
import { toast } from "sonner";

interface VideoCoreProps {
  className?: string;
  src?: string;
  handleNext?: () => void;
  [key: string]: any;
}

export function VideoCore({
  className = "",
  src = "",
  handleNext = () => {},
  ...props
}: VideoCoreProps) {
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const mouseMoveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const changeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const videoWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [showController, setShowController] = React.useState(false);
  const [clickDetected, setClickDetected] = React.useState(false);

  const isPlay = usePlayerStore((state) => state.isPlay);
  const autoNext = usePlayerStore((state) => state.autoNext);
  const setIsPlay = usePlayerStore((state) => state.setIsPlay);
  const setIsFullScreen = usePlayerStore((state) => state.setIsFullScreen);
  const setIsMuted = usePlayerStore((state) => state.setIsMuted);
  const setCurrentVolume = usePlayerStore((state) => state.setCurrentVolume);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);
  const setTimeVideo = usePlayerStore((state) => state.setTimeVideo);

  const controllerVariants = {
    hide: {
      translateY: "100%",
      opacity: 0,
    },
    show: {
      translateY: 0,
      opacity: 1,
    },
  };

  const handleStarting = React.useCallback(() => {
    setIsLoading(false);
    setIsError(false);
  }, []);

  const handleError = React.useCallback((message: string) => {
    setIsPlay(false);
    setIsLoading(false);
    setIsError(true);
    toast.error(message);
  }, [setIsPlay]);

  // Fullscreen hooks
  const { handleToggleFullScreen } = useFullscreen(videoWrapperRef, videoRef);

  // Hls player hooks
  const { handleTimeUpdate, syncTimeOnSeek } = useHlsPlayer({
    videoRef,
    src,
    onCanPlay: handleStarting,
    onError: handleError,
  });

  const videoStyles = cn("block w-full h-full select-none", {
    [className]: className,
  });

  const handleTogglePlay = React.useCallback(() => {
    if (isError) return;
    setIsPlay(!isPlay);
  }, [isError, isPlay, setIsPlay]);

  const handleShowController = () => {
    setShowController(true);
  };

  const handleHideController = () => {
    setShowController(false);
  };

  const handleCheckMousePointerPosition = () => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }

    setShowController(true);

    mouseMoveTimeoutRef.current = setTimeout(() => {
      handleHideController();
    }, 2500);
  };

  const handleClickInside = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    handleTogglePlay();
    setClickDetected(true);

    clickTimeoutRef.current = setTimeout(() => {
      setClickDetected(false);
    }, 1000);
  };

  const handleSeeking = () => {
    setIsPlay(false);
  };

  const handleSeeked = () => {
    setIsPlay(true);
  };

  const handleChangeTime = React.useCallback(
    (_: any, currentTimeVideo: number) => {
      if (isError) return;

      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }

      setTimeVideo("currentTime", currentTimeVideo);
      handleShowController();
      handleSeeking();

      changeTimeoutRef.current = setTimeout(() => {
        syncTimeOnSeek(currentTimeVideo);
        handleSeeked();
      }, 500);
    },
    [isError, setTimeVideo, syncTimeOnSeek]
  );

  const handleEndedVideo = () => {
    if (!autoNext) {
      setIsPlay(false);
      setIsFullScreen(false);
      return;
    }
    handleNext();
  };

  const handlePointer = (e: React.PointerEvent, callback: () => void) => {
    if (e.pointerType === "mouse") {
      callback();
    }
  };

  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={videoWrapperRef}
      onClick={handleClickInside}
      onTouchStart={handleCheckMousePointerPosition}
      onPointerEnter={(e) => handlePointer(e, handleShowController)}
      onPointerMove={(e) => handlePointer(e, handleCheckMousePointerPosition)}
      onPointerLeave={(e) => handlePointer(e, handleHideController)}
      className="video-wrapper relative w-full h-full"
    >
      <video
        ref={videoRef}
        className={videoStyles}
        onLoadStart={() => setIsLoading(true)}
        onError={() => handleError("Đã có lỗi xảy ra với video!")}
        onEnded={handleEndedVideo}
        onDurationChange={(e) => {
          setTimeVideo("duration", (e.target as HTMLVideoElement).duration || 0);
        }}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsPlay(true)}
        onPause={() => setIsPlay(false)}
        onCanPlay={handleStarting}
        onCanPlayThrough={handleStarting}
        crossOrigin="anonymous"
        preload="auto"
        playsInline
        {...props}
      />
      
      {isLoading && (
        <div className="absolute flex items-center justify-center inset-0 z-[8000] bg-bg-layout-loading cursor-default">
          <div className="loader"></div>
        </div>
      )}
      
      {isError && (
        <div className="absolute flex items-center justify-center inset-0 z-[9000] bg-bg-layout-loading cursor-default">
          <div className="max-w-[30%] flex flex-col items-center justify-center">
            <div className="size-[96px] mdm:size-[72px] text-primary">
              <PlayDisabled />
            </div>
            <span className="text-[14px] text-center text-primary whitespace-normal leading-[1.2] mt-[4px] font-normal">
              Rất tiếc vì sự cố này!
            </span>
          </div>
        </div>
      )}
      
      <div className="absolute flex items-center justify-center inset-0 z-[50]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={
            clickDetected
              ? { opacity: 1, scale: 1 }
              : { scale: 1.85, opacity: 0 }
          }
          className="w-[80px] h-[80px] flex items-center justify-center bg-bg-layer-btn rounded-[50%] opacity-85"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={clickDetected ? { opacity: 1 } : { opacity: 0 }}
          className="absolute"
        >
          <i className="text-[36px] text-primary">
            {!isPlay ? <IoPlay className="ml-[4px]" /> : <IoPause />}
          </i>
        </motion.div>
      </div>
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="controls absolute bottom-0 left-0 w-full h-[20%] mdm:h-[70px] flex items-end z-[2147483647] overflow-hidden"
      >
        <motion.div
          variants={controllerVariants}
          initial="hide"
          animate={showController ? "show" : "hide"}
          transition={{
            duration: 0.45,
            type: "tween",
            damping: 10,
            stiffness: 100,
          }}
          className="video-player-chrome w-full bg-bg-bar-controls"
        >
          <BarControls
            src={src}
            handlePlay={handleTogglePlay}
            handleChangeTime={handleChangeTime as any}
            handleFullScreen={handleToggleFullScreen}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default VideoCore;
