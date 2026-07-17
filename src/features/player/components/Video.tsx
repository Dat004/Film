'use client';

import { motion } from 'framer-motion';
import { Pause, Play, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { ToastMessage } from '@/components/ui/Toastify';
import { PlayDisabled } from '@/icons';
import { cn } from '@/lib/utils';

import { AUTO_HIDE_MS } from '../constants/playback.constants';
import { PLAYER_UI_COPY } from '../constants/player-ui.constants';
import { useHlsPlayer, type HlsQualityLevel } from '../hooks/useHlsPlayer';
import {
  useVideoFullScreen,
  enterVideoFullscreen,
  exitVideoFullscreen,
} from '../hooks/useVideoFullScreen';
import { useVideoGestures } from '../hooks/useVideoGestures';
import { useVideoKeyboard } from '../hooks/useVideoKeyboard';
import { useVideoPlaybackSync } from '../hooks/useVideoPlaybackSync';
import { useVideoPlayerStore, setStatusMovie, setTimeVideo } from '../store/video-player-store';

import BarControls from './PlayerContainer/VideoPlayer/BarControls';

export interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  className?: string;
  src?: string;
  handleNext?: () => void;
  playbackLocked?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onMediaReady?: () => void;
}

const controllerVariants = {
  hide: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const Video: React.FC<VideoProps> = ({
  className,
  src = '',
  handleNext = () => {},
  playbackLocked = false,
  videoRef: videoRefProp,
  onMediaReady,
  ...props
}) => {
  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = (videoRefProp ?? internalVideoRef) as React.RefObject<HTMLVideoElement>;

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hlsReloadKey, setHlsReloadKey] = useState(0);
  const [showController, setShowController] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<HlsQualityLevel[]>([]);
  const [currentQualityLevel, setCurrentQualityLevel] = useState(-1);

  const isVideoFocusedRef = useRef(false);
  const setHlsLevelRef = useRef<(index: number) => void>(() => {});
  const showControllerRef = useRef(showController);
  const settingsMenuOpenRef = useRef(settingsMenuOpen);
  const resumeAfterReloadRef = useRef<number | null>(null);

  useEffect(() => {
    showControllerRef.current = showController;
  }, [showController]);

  useEffect(() => {
    settingsMenuOpenRef.current = settingsMenuOpen;
  }, [settingsMenuOpen]);

  const isPiPSupported =
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    (document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled !==
      false;

  const { isMuted, isFullScreen, autoNext } = useVideoPlayerStore(
    useShallow((state) => ({
      isMuted: state.statusMovie.isMuted,
      isFullScreen: state.statusMovie.isFullScreen,
      autoNext: state.statusMovie.autoNext,
    }))
  );
  const duration = useVideoPlayerStore((s) => s.time.duration);

  const controlsVisible = showController || settingsMenuOpen;

  const clearAutoHide = useCallback(() => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
      mouseMoveTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    clearAutoHide();
    mouseMoveTimeoutRef.current = setTimeout(() => {
      if (!settingsMenuOpenRef.current) setShowController(false);
    }, AUTO_HIDE_MS);
  }, [clearAutoHide]);

  const revealControls = useCallback(() => {
    setShowController(true);
    scheduleAutoHide();
  }, [scheduleAutoHide]);

  useEffect(() => {
    if (!settingsMenuOpen && showControllerRef.current) scheduleAutoHide();
  }, [settingsMenuOpen, scheduleAutoHide]);

  const { isPlay, handleTimeUpdate, handleChangeTime, handleTogglePlay } = useVideoPlaybackSync({
    videoRef,
    playbackLocked,
    isError,
    changeTimeoutRef,
    revealControls,
  });

  const {
    playFlash,
    seekRipples,
    setSeekRipples,
    seekLabel,
    flashPlayPause,
    applyDoubleTapSeek,
    handleZonePointerUp,
    cleanupGestures,
  } = useVideoGestures({
    videoRef,
    videoWrapperRef,
    duration,
    isError,
    playbackLocked,
    handleTogglePlay,
    revealControls,
  });

  const handleStarting = () => {
    setIsLoading(false);
    setIsError(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = useVideoPlayerStore.getState().statusMovie.playbackRate;
      const resumeAt = resumeAfterReloadRef.current;
      if (resumeAt != null && Number.isFinite(resumeAt) && resumeAt > 0) {
        try {
          videoRef.current.currentTime = resumeAt;
        } catch {
          /* ignore */
        }
        setTimeVideo({ key: 'currentTime', value: resumeAt });
        resumeAfterReloadRef.current = null;
        setStatusMovie({ key: 'isPlay', value: true });
      }
    }
    onMediaReady?.();
  };

  const handleError = (message: string) => {
    setStatusMovie({ key: 'isPlay', value: false });
    setIsLoading(false);
    setIsError(true);
    ToastMessage.error(message);
  };

  const handleRetryPlayback = useCallback(() => {
    resumeAfterReloadRef.current = useVideoPlayerStore.getState().time.currentTime;
    setIsError(false);
    setIsLoading(true);
    setHlsReloadKey((k) => k + 1);
  }, []);

  useHlsPlayer({
    videoRef,
    src,
    reloadKey: hlsReloadKey,
    onReady: handleStarting,
    onError: handleError,
    onTimeReset: () => {
      setIsError(false);
      setQualityLevels([]);
      setCurrentQualityLevel(-1);
      setTimeVideo({ key: 'currentTime', value: 0 });
      setTimeVideo({ key: 'duration', value: 0 });
    },
    onQualityReady: (api) => {
      setQualityLevels(api.levels);
      setCurrentQualityLevel(api.getCurrentLevel());
      setHlsLevelRef.current = (index: number) => {
        api.setLevel(index);
        setCurrentQualityLevel(index);
      };
    },
  });

  useVideoFullScreen({ videoWrapperRef, videoRef, isFullScreen });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadeddata = () => {
      video.currentTime = useVideoPlayerStore.getState().time.currentTime;
      setIsError(false);
    };

    video.addEventListener('loadedmetadata', handleLoadeddata);
    return () => video.removeEventListener('loadedmetadata', handleLoadeddata);
  }, []);

  const handleToggleFullScreen = useCallback(() => {
    if (isError) return;
    if (isFullScreen) {
      exitVideoFullscreen(videoRef.current);
      setStatusMovie({ key: 'isFullScreen', value: false });
    } else {
      enterVideoFullscreen(videoWrapperRef.current, videoRef.current);
      setStatusMovie({ key: 'isFullScreen', value: true });
    }
  }, [isError, isFullScreen]);

  useVideoKeyboard({
    isVideoFocusedRef,
    isError,
    playbackLocked,
    handleTogglePlay,
    flashPlayPause,
    revealControls,
    applyDoubleTapSeek,
    handleToggleFullScreen,
  });

  const handleTogglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isPiPSupported) return;
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      ToastMessage.error(PLAYER_UI_COPY.errorPip);
    }
  }, [isPiPSupported]);

  const handleQualityChange = useCallback((index: number) => {
    setHlsLevelRef.current(index);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnter = () => setIsPiPActive(true);
    const onLeave = () => setIsPiPActive(false);

    video.addEventListener('enterpictureinpicture', onEnter);
    video.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter);
      video.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, [src]);

  useEffect(() => {
    return () => {
      clearAutoHide();
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
      cleanupGestures();
    };
  }, [clearAutoHide, cleanupGestures]);

  const handleEndedVideo = () => {
    if (!autoNext) {
      setStatusMovie({ key: 'isPlay', value: false });
      setStatusMovie({ key: 'isFullScreen', value: false });
      return;
    }
    handleNext();
  };

  const videoStyles = cn('block w-full h-full select-none', {
    [className ?? '']: className,
  });

  return (
    <div
      ref={videoWrapperRef}
      onPointerEnter={(e) => {
        isVideoFocusedRef.current = true;
        if (e.pointerType === 'mouse') revealControls();
      }}
      onPointerMove={(e) => {
        if (e.pointerType === 'mouse') revealControls();
      }}
      onPointerLeave={(e) => {
        isVideoFocusedRef.current = false;
        if (e.pointerType === 'mouse' && !settingsMenuOpenRef.current) {
          clearAutoHide();
          setShowController(false);
        }
      }}
      className="video-wrapper relative h-full w-full overflow-visible"
      tabIndex={0}
      role="application"
      aria-label="Trình phát video"
    >
      <video
        ref={videoRef}
        className={videoStyles}
        onLoadStart={() => setIsLoading(true)}
        onError={() => handleError(PLAYER_UI_COPY.errorGeneric)}
        onEnded={handleEndedVideo}
        onDurationChange={(e) => {
          const target = e.target as HTMLVideoElement;
          setTimeVideo({ key: 'duration', value: target.duration || 0 });
        }}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          if (!useVideoPlayerStore.getState().statusMovie.isPlay) {
            setStatusMovie({ key: 'isPlay', value: true });
          }
        }}
        onPause={() => {
          if (useVideoPlayerStore.getState().statusMovie.isPlay) {
            setStatusMovie({ key: 'isPlay', value: false });
          }
        }}
        onCanPlay={handleStarting}
        onCanPlayThrough={handleStarting}
        crossOrigin="anonymous"
        muted={isMuted}
        preload="auto"
        playsInline
        {...props}
      />

      <div
        className={cn(
          'absolute inset-0 z-[90] grid grid-cols-3',
          settingsMenuOpen && 'pointer-events-none'
        )}
      >
        {(['left', 'center', 'right'] as const).map((zone) => (
          <button
            key={zone}
            type="button"
            tabIndex={-1}
            aria-label={
              zone === 'left'
                ? 'Chạm đúp để lùi 10 giây'
                : zone === 'right'
                  ? 'Chạm đúp để tiến 10 giây'
                  : 'Chạm để hiện điều khiển'
            }
            className="border-0 bg-transparent p-0"
            onPointerUp={(e) => {
              if (e.pointerType === 'mouse' && e.button !== 0) return;
              e.preventDefault();
              handleZonePointerUp(zone, e.pointerType, { x: e.clientX, y: e.clientY });
            }}
          />
        ))}
      </div>

      {(seekRipples.length > 0 || seekLabel) && (
        <div className="seek-ripple-layer" aria-hidden>
          {seekRipples.map((ripple) => (
            <span
              key={ripple.id}
              className="seek-ripple-burst"
              style={{ left: ripple.x, top: ripple.y }}
              onAnimationEnd={() => {
                setSeekRipples((list) => list.filter((r) => r.id !== ripple.id));
              }}
            />
          ))}
          {seekLabel && (
            <div
              className="seek-ripple-meta"
              style={{
                left: seekLabel.side === 'left' ? '22%' : '78%',
                top: '50%',
              }}
            >
              <div className="seek-ripple-icon">
                {seekLabel.side === 'left' ? (
                  <ChevronsLeft className="size-[28px]" strokeWidth={2.25} />
                ) : (
                  <ChevronsRight className="size-[28px]" strokeWidth={2.25} />
                )}
              </div>
              <span className="seek-ripple-seconds">{seekLabel.seconds} giây</span>
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={playFlash ? { opacity: 1, scale: 1 } : { scale: 1.85, opacity: 0 }}
          className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-bg-layer-btn opacity-85"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: playFlash ? 1 : 0 }}
          className="absolute"
        >
          <i className="text-[36px] text-primary">
            {!isPlay ? <Play className="ml-[4px]" /> : <Pause />}
          </i>
        </motion.div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-[999] flex cursor-default items-center justify-center bg-bg-layout-loading">
          <div className="loader" />
        </div>
      )}

      {isError && (
        <div className="absolute inset-0 z-[1000] flex cursor-default items-center justify-center bg-bg-layout-loading">
          <div className="flex max-w-[80%] flex-col items-center justify-center gap-y-[12px] px-[16px]">
            <div className="size-[72px] text-primary detail769:size-[96px]">
              <PlayDisabled />
            </div>
            <span className="text-center text-[14px] font-normal leading-[1.3] text-primary whitespace-normal">
              {PLAYER_UI_COPY.errorRetryTitle}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRetryPlayback();
              }}
              className="mt-[4px] inline-flex h-[40px] items-center justify-center rounded-[10px] bg-white px-[18px] text-[13px] font-semibold text-black transition-opacity hover:opacity-90 active:opacity-80"
            >
              {PLAYER_UI_COPY.errorRetryAction}
            </button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'controls pointer-events-none absolute bottom-0 left-0 z-[2147483647] flex w-full items-end overflow-visible',
          !controlsVisible && 'pointer-events-none'
        )}
      >
        <motion.div
          variants={controllerVariants}
          initial="hide"
          animate={controlsVisible ? 'show' : 'hide'}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="video-player-chrome pointer-events-none w-full bg-bg-bar-controls pt-[28px] detail769:pt-[64px]"
        >
          <div
            className={cn(controlsVisible ? 'pointer-events-auto' : 'pointer-events-none')}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <BarControls
              handlePlay={() => {
                handleTogglePlay();
                flashPlayPause();
              }}
              handleChangeTime={handleChangeTime}
              handleFullScreen={handleToggleFullScreen}
              handleTogglePiP={handleTogglePiP}
              isPiPActive={isPiPActive}
              isPiPSupported={isPiPSupported}
              qualityLevels={qualityLevels}
              currentQualityLevel={currentQualityLevel}
              onQualityChange={handleQualityChange}
              onSettingsOpenChange={setSettingsMenuOpen}
              onInteraction={revealControls}
              controlsVisible={controlsVisible}
              playbackLocked={playbackLocked}
              previewSrc={src}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Video;
