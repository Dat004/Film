'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import RangeSlider from '@/components/ui/RangeSlider';
import { CurrentTime } from '@/features/film';
import { cn } from '@/lib/utils';

import { useVideoPlayerStore, setStatusMovie, setTimeVideo } from '../store/video-player-store';

export interface FloatingMiniPlayerProps {
  isFloating: boolean;
  onRestore: () => void;
  onClose: () => void;
  filmTitle?: string;
  episodeName?: string;
  posterUrl?: string;
}

export function FloatingMiniPlayer({
  isFloating,
  onRestore,
  onClose,
  filmTitle = 'Phim đang xem',
  episodeName = '',
  posterUrl = '',
}: FloatingMiniPlayerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isPlay, isMuted, currentVolume, currentTime, duration } = useVideoPlayerStore(
    useShallow((state) => ({
      isPlay: state.statusMovie.isPlay,
      isMuted: state.statusMovie.isMuted,
      currentVolume: state.statusMovie.currentVolume,
      currentTime: state.time.currentTime,
      duration: state.time.duration,
    }))
  );

  // Format episode name cleanly (avoid duplicated "Tập Tập 01")
  const formattedEpisodeName = episodeName
    ? episodeName.startsWith('Tập')
      ? episodeName
      : `Tập ${episodeName}`
    : '';

  // Optimized Canvas Frame Mirroring: 30 FPS Throttling & On-demand Seek Rendering
  useEffect(() => {
    if (!isFloating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawSingleFrame = () => {
      const video = document.querySelector('video') as HTMLVideoElement | null;
      if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    // Draw single frame on demand (triggers on seek or status toggle)
    drawSingleFrame();

    // Do NOT run continuous loop when video is paused (Saves 100% CPU/GPU overhead)
    if (!isPlay) return;

    let animId: number;
    let lastTime = 0;
    const FRAME_INTERVAL_MS = 33; // 30 FPS (matches standard 24/30 FPS film playback)

    const renderLoop = (timestamp: number) => {
      if (timestamp - lastTime >= FRAME_INTERVAL_MS) {
        drawSingleFrame();
        lastTime = timestamp;
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isFloating, isPlay, currentTime]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusMovie({ key: 'isPlay', value: !isPlay });
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusMovie({ key: 'isMuted', value: !isMuted });
  };

  const handleSeek = (_e: unknown, value: number) => {
    setTimeVideo({ key: 'currentTime', value });
  };

  return (
    <AnimatePresence>
      {isFloating && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.92 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'fixed z-[9999] aspect-video rounded-[12px] overflow-hidden backdrop-blur-md',
            'bg-black/90 border border-bd-filed-form-color shadow-2xl ring-1 ring-white/10 group select-none cursor-pointer',
            // Mobile responsive layout: centered at bottom on mobile, fixed right on desktop
            'bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 w-[calc(100vw-24px)] sm:w-[320px] mdm:w-[360px]'
          )}
          onClick={onRestore}
        >
          {/* Fallback Background Poster / Thumbnail */}
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={filmTitle}
              className="absolute inset-0 w-full h-full object-cover opacity-45 blur-[1px] scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-bg-sidebar to-black/80 opacity-60" />
          )}

          {/* Live Mirroring Canvas Video Frame */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-[2]" />

          {/* Dark Overlay Gradient */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/75 z-[3] transition-opacity duration-200',
              isHovered || !isPlay ? 'opacity-100' : 'opacity-40'
            )}
          />

          {/* Top Bar: Title & Action Controls */}
          <div
            className={cn(
              'absolute top-0 left-0 right-0 p-2.5 flex items-center justify-between z-10 transition-opacity duration-200',
              isHovered || !isPlay ? 'opacity-100' : 'opacity-80 sm:opacity-0'
            )}
          >
            <div className="min-w-0 pr-2">
              <p className="text-[12px] sm:text-[13px] font-semibold text-primary truncate leading-tight drop-shadow">
                {filmTitle}
              </p>
              {formattedEpisodeName ? (
                <p className="text-[10px] text-white/70 truncate">{formattedEpisodeName}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title="Phóng to về trình phát chính"
                aria-label="Phóng to"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors border border-white/10"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                title="Đóng trình phát nổi"
                aria-label="Đóng"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors border border-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center: Play/Pause Button - YouTube/Netflix UX: Hidden while playing unless hovered or paused */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlay ? 'Tạm dừng' : 'Phát'}
              className={cn(
                'pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full',
                'bg-[var(--hover-color)] text-white shadow-lg transition-all duration-200',
                isHovered || !isPlay
                  ? 'scale-100 opacity-100'
                  : 'scale-90 opacity-0 pointer-events-none'
              )}
            >
              {isPlay ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Bottom Bar: Mute + Progress Bar + Time */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-2.5 space-y-1.5 z-10 transition-opacity duration-200',
              isHovered || !isPlay ? 'opacity-100' : 'opacity-80 sm:opacity-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  className="text-white hover:text-[var(--hover-color)] transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="text-[10px] text-white/60">
                  {Math.round(currentVolume * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-1">
                <CurrentTime currentTime={currentTime} className="text-[inherit]" />
                <span>/</span>
                <CurrentTime currentTime={duration} className="text-white/40" />
              </div>
            </div>

            <RangeSlider
              value={currentTime}
              max={duration || 100}
              onChange={handleSeek}
              borderRadius={2}
              className="w-full h-1"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingMiniPlayer;
