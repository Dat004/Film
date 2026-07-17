'use client';

import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  PictureInPicture,
  PictureInPicture2,
  Check,
  Settings2,
} from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';

import RangeSlider from '@/components/ui/RangeSlider';
import { CurrentTime } from '@/features/film';
import { cn } from '@/lib/utils';

import { PLAYER_UI_COPY } from '../../../../constants/player-ui.constants';
import type { HlsQualityLevel } from '../../../../hooks/useHlsPlayer';
import { useVideoPlayerStore, setStatusMovie } from '../../../../store/video-player-store';
import { PLAYBACK_RATES } from '../../../../types/player.types';

import ThumbnailVideo from './ThumbnailVideo';

export interface BarControlsProps {
  handlePlay?: () => void;
  handleChangeTime?: (event: unknown, value: number) => void;
  handleFullScreen?: () => void;
  handleTogglePiP?: () => void;
  isPiPActive?: boolean;
  isPiPSupported?: boolean;
  qualityLevels?: HlsQualityLevel[];
  currentQualityLevel?: number;
  onQualityChange?: (index: number) => void;
  onSettingsOpenChange?: (open: boolean) => void;
  /** Keep chrome visible (scrub / volume / menu). */
  onInteraction?: () => void;
  /** Clears the seek preview when the controls hide. */
  controlsVisible?: boolean;
  /** Blocks playback controls for watch-party guests. */
  playbackLocked?: boolean;
  /** Media source used to generate seek thumbnails. */
  previewSrc?: string;
}

const formatRate = (rate: number) => (rate === 1 ? '1x' : `${rate}x`);

const settingsPanelClass = cn(
  'video-player-chrome z-[2147483647] min-w-[180px] overflow-y-auto overscroll-contain',
  'rounded-[12px] border-0 bg-[#12141a] p-[8px]',
  'shadow-[0_16px_48px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.08]'
);

const settingsMenuItemClass = cn(
  'flex w-full items-center justify-between gap-x-3 rounded-[10px] px-[10px] py-[10px] text-[13px] cursor-pointer',
  'text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors',
  'active:bg-white/[0.08]'
);

const settingsMenuLabelClass =
  'px-[10px] py-[4px] text-[11px] font-medium tracking-wide text-white/35';

const settingsMenuSeparatorClass = '-mx-1 my-1 h-px bg-white/[0.08]';

const iconBtnClass = cn(
  'inline-flex shrink-0 items-center justify-center rounded-[8px]',
  'text-white/90 transition-colors',
  'hover:bg-white/[0.12] hover:text-white',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
  'disabled:pointer-events-none disabled:opacity-35',
  /* Keep the mobile gesture area clear. */
  'size-[36px] detail769:size-[40px]'
);

const BarControls: React.FC<BarControlsProps> = ({
  handlePlay = () => {},
  handleChangeTime = () => {},
  handleFullScreen = () => {},
  handleTogglePiP = () => {},
  isPiPActive = false,
  isPiPSupported = false,
  qualityLevels = [],
  currentQualityLevel = -1,
  onQualityChange = () => {},
  onSettingsOpenChange,
  onInteraction = () => {},
  controlsVisible = true,
  playbackLocked = false,
  previewSrc = '',
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    right: number;
    bottom: number;
    maxHeight: number;
  } | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const seekAreaRef = useRef<HTMLDivElement>(null);

  const [previewTime, setPreviewTime] = useState(0);
  const [previewX, setPreviewX] = useState(0);
  const [isSeekHover, setIsSeekHover] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const suppressHoverUntilRef = useRef(0);

  const { currentTime, duration, isPlay, isMuted, currentVolume, isFullScreen, playbackRate } =
    useVideoPlayerStore(
      useShallow((state) => ({
        currentTime: state.time.currentTime,
        duration: state.time.duration,
        isPlay: state.statusMovie.isPlay,
        isMuted: state.statusMovie.isMuted,
        currentVolume: state.statusMovie.currentVolume,
        isFullScreen: state.statusMovie.isFullScreen,
        playbackRate: state.statusMovie.playbackRate,
      }))
    );

  const hasQualityMenu = qualityLevels.length > 1;
  const showPiP = isPiPSupported;
  const canPreview = Boolean(previewSrc) && !playbackLocked && duration > 0;

  // iOS emits compatibility mouse events after touch, so mobile previews only while scrubbing.
  const showPreview =
    canPreview && (isScrubbing || (isSeekHover && Date.now() >= suppressHoverUntilRef.current));

  const clampPreviewX = (clientX: number) => {
    const area = seekAreaRef.current;
    if (!area) return 0;
    const rect = area.getBoundingClientRect();
    const previewW = isScrubbing ? 132 : 160;
    const raw = clientX - rect.left;
    return Math.max(previewW / 2, Math.min(rect.width - previewW / 2, raw));
  };

  const updatePreview = (e: React.PointerEvent, value: number) => {
    setPreviewTime(value);
    setPreviewX(clampPreviewX(e.clientX));
  };

  const handleSeekMove = (e: React.PointerEvent<HTMLDivElement>, value: number) => {
    if (playbackLocked) return;
    updatePreview(e, value);
  };

  const handleSeekChange = (e: unknown, value: number) => {
    if (playbackLocked) return;
    onInteraction();
    handleChangeTime(e, value);
  };

  const endScrub = () => {
    setIsScrubbing(false);
    setIsSeekHover(false);
    // Ignore compatibility mouse events after touch scrubbing.
    suppressHoverUntilRef.current = Date.now() + 800;
  };

  const clearSeekPreview = () => {
    if (!isScrubbing) setIsSeekHover(false);
  };

  useEffect(() => {
    if (!isScrubbing) return;
    const up = () => endScrub();
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('touchend', up);
    window.addEventListener('touchcancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('touchend', up);
      window.removeEventListener('touchcancel', up);
    };
  }, [isScrubbing]);

  // Reset the preview decoder when the media source changes.
  useEffect(() => {
    setPreviewTime(0);
    setIsScrubbing(false);
    setIsSeekHover(false);
  }, [previewSrc]);

  // Hidden controls can still receive pointer events; clear the thumbnail explicitly.
  useEffect(() => {
    if (controlsVisible) return;
    setIsScrubbing(false);
    setIsSeekHover(false);
  }, [controlsVisible]);

  const handleChangeVolume = (_: unknown, volume: number) => {
    onInteraction();
    setStatusMovie({ key: 'isMuted', value: volume === 0 });
    setStatusMovie({ key: 'currentVolume', value: volume });
  };

  const handleToggleMuteVideo = () => {
    onInteraction();
    setStatusMovie({ key: 'currentVolume', value: !isMuted ? 0 : 1 });
    setStatusMovie({ key: 'isMuted', value: !isMuted });
  };

  const setSettingsMenuOpen = (open: boolean) => {
    setSettingsOpen(open);
    onSettingsOpenChange?.(open);
    if (open) onInteraction();
  };

  useLayoutEffect(() => {
    if (!settingsOpen || !settingsButtonRef.current) {
      setMenuPos(null);
      return;
    }
    const place = () => {
      const rect = settingsButtonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 8;
      const vv = window.visualViewport;
      const viewTop = vv?.offsetTop ?? 0;
      const safeTop = viewTop + gap;
      // Available height between the safe area and settings button.
      const spaceAbove = Math.max(96, rect.top - safeTop - gap);
      const maxHeight = Math.min(240, spaceAbove);
      // Place the panel above the settings button.
      const bottom = Math.max(gap, window.innerHeight - rect.top + gap);

      setMenuPos({
        right: Math.max(gap, window.innerWidth - rect.right),
        bottom,
        maxHeight,
      });
    };
    place();
    window.addEventListener('resize', place);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [settingsOpen]);

  // Delay outside-close to ignore the opening tap on mobile.
  useEffect(() => {
    if (!settingsOpen) return;
    let remove: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (settingsButtonRef.current?.contains(target)) return;
        if (settingsPanelRef.current?.contains(target)) return;
        setSettingsMenuOpen(false);
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setSettingsMenuOpen(false);
      };
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
      remove = () => {
        document.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, 50);
    return () => {
      window.clearTimeout(timer);
      remove?.();
    };
  }, [settingsOpen]);

  return (
    <div className="video-controls-chrome flex w-full flex-col">
      {/* Row 1 — full-width seek */}
      <div
        ref={seekAreaRef}
        className="group/slider relative w-full px-[10px] pb-[0] pt-[8px] detail769:px-[16px] detail769:pb-[2px] detail769:pt-[18px]"
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return;
          if (Date.now() < suppressHoverUntilRef.current) return;
          setIsSeekHover(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') clearSeekPreview();
        }}
        onPointerDown={(e) => {
          if (playbackLocked) return;
          onInteraction();
          setIsScrubbing(true);
          setIsSeekHover(false);
        }}
      >
        <RangeSlider
          max={duration || 1}
          borderRadius={2}
          value={currentTime}
          disabled={playbackLocked}
          {...(playbackLocked ? {} : { onMove: handleSeekMove })}
          onChange={handleSeekChange}
          className="h-[22px] detail769:h-[22px]"
        />

        {/* Preview only while actively scrubbing (mobile) or hovering (desktop) */}
        {showPreview && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 bottom-[calc(100%+8px)]"
            style={{ left: previewX }}
          >
            <div
              className={cn(
                'flex flex-col items-center overflow-hidden rounded-[8px] bg-[#0c0e12]/95 ring-1 ring-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.55)]',
                isScrubbing ? 'w-[132px]' : 'w-[160px]'
              )}
            >
              <ThumbnailVideo
                src={previewSrc}
                currentTimeCapture={previewTime}
                className={cn('w-full', isScrubbing ? 'h-[74px]' : 'h-[90px]')}
              />
              <CurrentTime
                className={cn(
                  'w-full py-[5px] text-center font-semibold tabular-nums text-white',
                  isScrubbing ? 'text-[14px]' : 'text-[12px]'
                )}
                currentTime={previewTime}
              />
            </div>
          </div>
        )}

        {playbackLocked && (
          <p className="pointer-events-none absolute inset-x-0 -bottom-0.5 text-center text-[10px] text-white/55">
            {PLAYER_UI_COPY.hostLockedPlaySeek}
          </p>
        )}
      </div>

      {/* Row 2 — transport + time | settings + fullscreen */}
      <div className="flex w-full items-center justify-between gap-x-[4px] px-[6px] pb-[6px] pt-[2px] detail769:gap-x-[8px] detail769:px-[12px] detail769:pb-[14px] detail769:pt-[6px]">
        <div className="flex min-w-0 items-center gap-x-[1px] detail769:gap-x-[6px]">
          <button
            type="button"
            onClick={() => {
              onInteraction();
              handlePlay();
            }}
            disabled={playbackLocked}
            aria-label={
              playbackLocked
                ? PLAYER_UI_COPY.hostLockedPlay
                : isPlay
                  ? PLAYER_UI_COPY.pause
                  : PLAYER_UI_COPY.play
            }
            title={
              playbackLocked
                ? PLAYER_UI_COPY.hostLockedPlay
                : isPlay
                  ? PLAYER_UI_COPY.pauseShortcut
                  : PLAYER_UI_COPY.playShortcut
            }
            className={iconBtnClass}
          >
            {!isPlay ? (
              <Play className="ml-[2px] size-[18px] detail769:size-[20px]" strokeWidth={1.75} />
            ) : (
              <Pause className="size-[18px] detail769:size-[20px]" strokeWidth={1.75} />
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleMuteVideo}
            aria-label={isMuted ? PLAYER_UI_COPY.unmute : PLAYER_UI_COPY.mute}
            title={isMuted ? PLAYER_UI_COPY.unmuteShortcut : PLAYER_UI_COPY.muteShortcut}
            className={iconBtnClass}
          >
            {isMuted ? (
              <VolumeX className="size-[17px] detail769:size-[18px]" strokeWidth={1.75} />
            ) : (
              <Volume2 className="size-[17px] detail769:size-[18px]" strokeWidth={1.75} />
            )}
          </button>

          <RangeSlider
            className="hidden w-[72px] shrink-0 sm:flex detail769:w-[100px]"
            borderRadius={4}
            onChange={handleChangeVolume}
            value={currentVolume}
            max={1}
          />

          <div className="ml-[2px] flex select-none items-center gap-x-[3px] whitespace-nowrap tabular-nums text-[11px] font-medium text-white/90 detail769:ml-[8px] detail769:text-[13px]">
            <CurrentTime className="text-[inherit] text-white/90" currentTime={currentTime} />
            <span className="text-white/35">/</span>
            <CurrentTime className="text-[inherit] text-white/50" currentTime={duration} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-x-[2px]">
          <button
            ref={settingsButtonRef}
            type="button"
            title={PLAYER_UI_COPY.settingsPlayback}
            aria-label={PLAYER_UI_COPY.settingsPlayback}
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation();
              setSettingsMenuOpen(!settingsOpen);
            }}
            className={cn(
              iconBtnClass,
              (settingsOpen || isPiPActive || currentQualityLevel !== -1) && 'bg-white/[0.12]'
            )}
          >
            <Settings2 className="size-[17px] detail769:size-[18px]" strokeWidth={1.75} />
          </button>

          {settingsOpen &&
            menuPos &&
            typeof document !== 'undefined' &&
            createPortal(
              <div
                ref={settingsPanelRef}
                role="menu"
                className={settingsPanelClass}
                style={{
                  position: 'fixed',
                  right: menuPos.right,
                  bottom: menuPos.bottom,
                  maxHeight: menuPos.maxHeight,
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <p className={settingsMenuLabelClass}>
                  {PLAYER_UI_COPY.speedLabel}
                  {playbackLocked ? PLAYER_UI_COPY.hostHintSuffix : ''}
                </p>
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    role="menuitem"
                    disabled={playbackLocked}
                    title={playbackLocked ? PLAYER_UI_COPY.hostLockedSpeed : undefined}
                    onClick={() => {
                      if (playbackLocked) return;
                      setStatusMovie({ key: 'playbackRate', value: rate });
                      setSettingsMenuOpen(false);
                    }}
                    className={cn(
                      settingsMenuItemClass,
                      playbackRate === rate && 'bg-white/[0.08] text-white',
                      playbackLocked && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span>{formatRate(rate)}</span>
                    {playbackRate === rate && <Check className="size-[14px]" />}
                  </button>
                ))}

                {hasQualityMenu && (
                  <>
                    <div className={settingsMenuSeparatorClass} />
                    <p className={settingsMenuLabelClass}>{PLAYER_UI_COPY.qualityLabel}</p>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onQualityChange(-1);
                        setSettingsMenuOpen(false);
                      }}
                      className={cn(
                        settingsMenuItemClass,
                        currentQualityLevel === -1 && 'bg-white/[0.08] text-white'
                      )}
                    >
                      <span>{PLAYER_UI_COPY.qualityAuto}</span>
                      {currentQualityLevel === -1 && <Check className="size-[14px]" />}
                    </button>
                    {qualityLevels.map((level) => (
                      <button
                        key={level.index}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onQualityChange(level.index);
                          setSettingsMenuOpen(false);
                        }}
                        className={cn(
                          settingsMenuItemClass,
                          currentQualityLevel === level.index && 'bg-white/[0.08] text-white'
                        )}
                      >
                        <span>{level.label}</span>
                        {currentQualityLevel === level.index && <Check className="size-[14px]" />}
                      </button>
                    ))}
                  </>
                )}

                {showPiP && (
                  <>
                    <div className={settingsMenuSeparatorClass} />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        handleTogglePiP();
                        setSettingsMenuOpen(false);
                      }}
                      className={cn(settingsMenuItemClass, 'justify-start gap-x-[10px]')}
                    >
                      {isPiPActive ? (
                        <PictureInPicture2 className="size-[15px] text-white/45" />
                      ) : (
                        <PictureInPicture className="size-[15px] text-white/45" />
                      )}
                      <span>{isPiPActive ? PLAYER_UI_COPY.pipExit : PLAYER_UI_COPY.pipEnter}</span>
                    </button>
                  </>
                )}
              </div>,
              document.body
            )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInteraction();
              handleFullScreen();
            }}
            title={
              isFullScreen
                ? PLAYER_UI_COPY.exitFullscreenShortcut
                : PLAYER_UI_COPY.fullscreenShortcut
            }
            aria-label={isFullScreen ? PLAYER_UI_COPY.exitFullscreen : PLAYER_UI_COPY.fullscreen}
            className={iconBtnClass}
          >
            {isFullScreen ? (
              <Minimize className="size-[17px] detail769:size-[18px]" strokeWidth={1.75} />
            ) : (
              <Maximize className="size-[17px] detail769:size-[18px]" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarControls;
