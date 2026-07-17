'use client';

import {
  Settings,
  Sun,
  Repeat,
  SkipForward,
  PanelTop,
  Flag,
  Share2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import React from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import ScreenDimmer from '@/components/ui/ScreenDimmer';
import { Switch } from '@/components/ui/Switch';
import { ToastMessage } from '@/components/ui/Toastify';
import WatchListButton from '@/components/ui/WatchListButton';
import { copyTextToClipboard } from '@/lib/clipboard';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

import { PLAYER_UI_COPY } from '../../../../constants/player-ui.constants';
import { useVideoPlayerStore, setStatusMovie } from '../../../../store/video-player-store';
import type { StatusMovie } from '../../../../types/player.types';

export interface BarPlayerProps {
  handleNext?: () => void;
  handlePrev?: () => void;
  episodeCount?: number;
  episodeName?: string;
  disabled?: boolean;
  isWatchParty?: boolean;
  isHost?: boolean;
}

/* Above ScreenDimmer (z-1001) — popovers portal to body, so they sit under the dimmer if ≤520 */
const panelClass =
  'video-player-chrome z-[1100] min-w-[228px] rounded-[12px] border-0 bg-[#12141a] p-[8px] text-primary shadow-[0_16px_48px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.08]';

const iconBtnClass = cn(
  'inline-flex size-[40px] shrink-0 items-center justify-center rounded-[10px]',
  'text-white/55 transition-colors',
  'hover:bg-white/[0.07] hover:text-white/90',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
  'disabled:pointer-events-none disabled:opacity-30'
);

const textNavClass = cn(
  'inline-flex h-[40px] shrink-0 items-center gap-x-[6px] rounded-[10px] px-[12px]',
  'text-[13px] font-medium text-white/70 transition-colors',
  'hover:bg-white/[0.07] hover:text-white',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
  'disabled:pointer-events-none disabled:opacity-30'
);

const SettingRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  hint?: string | undefined;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}> = ({ icon, label, hint, checked, disabled, onCheckedChange }) => (
  <label
    className={cn(
      'flex cursor-pointer items-center gap-x-[12px] rounded-[10px] px-[10px] py-[10px]',
      'hover:bg-white/[0.05]',
      disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent'
    )}
    title={hint}
  >
    <span className="size-[16px] shrink-0 text-white/45 [&>svg]:size-full" aria-hidden>
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-medium text-white/90">{label}</span>
      {hint ? (
        <span className="mt-[2px] block text-[11px] leading-snug text-white/35">{hint}</span>
      ) : null}
    </span>
    <Switch
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className="data-[state=unchecked]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]"
    />
  </label>
);

const SettingsPopover: React.FC<{
  isLight: boolean;
  autoPlay: boolean;
  autoNext: boolean;
  isTheater: boolean;
  syncLocked: boolean;
  isWatchParty: boolean;
  onSetStatus: <K extends keyof StatusMovie>(key: K, value: StatusMovie[K]) => void;
}> = ({ isLight, autoPlay, autoNext, isTheater, syncLocked, isWatchParty, onSetStatus }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className={iconBtnClass}
        title={PLAYER_UI_COPY.settingsWatch}
        aria-label={PLAYER_UI_COPY.settingsWatch}
      >
        <Settings className="size-[18px]" strokeWidth={1.75} />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" side="top" sideOffset={10} className={panelClass}>
      <p className="px-[10px] pb-[6px] pt-[4px] text-[11px] font-medium tracking-wide text-white/35">
        {PLAYER_UI_COPY.settingsWatchOptions}
      </p>
      <SettingRow
        icon={<Sun />}
        label={PLAYER_UI_COPY.lightLabel}
        hint={PLAYER_UI_COPY.lightHint}
        checked={isLight}
        onCheckedChange={(v) => onSetStatus('isLight', v)}
      />
      <SettingRow
        icon={<Repeat />}
        label={PLAYER_UI_COPY.autoPlayLabel}
        hint={
          syncLocked
            ? PLAYER_UI_COPY.hostSyncHint
            : isWatchParty
              ? PLAYER_UI_COPY.roomSyncHint
              : undefined
        }
        checked={autoPlay}
        disabled={syncLocked}
        onCheckedChange={(v) => onSetStatus('autoPlay', v)}
      />
      <SettingRow
        icon={<SkipForward />}
        label={PLAYER_UI_COPY.autoNextLabel}
        hint={
          syncLocked
            ? PLAYER_UI_COPY.hostSyncHint
            : isWatchParty
              ? PLAYER_UI_COPY.roomSyncHint
              : undefined
        }
        checked={autoNext}
        disabled={syncLocked}
        onCheckedChange={(v) => onSetStatus('autoNext', v)}
      />
      {!isWatchParty && (
        <SettingRow
          icon={<PanelTop />}
          label={PLAYER_UI_COPY.theaterLabel}
          hint={PLAYER_UI_COPY.deviceOnlyHint}
          checked={isTheater}
          onCheckedChange={(v) => onSetStatus('isTheater', v)}
        />
      )}
    </PopoverContent>
  </Popover>
);

const MorePopover: React.FC<{
  onReport: () => void;
  onShare: () => void;
}> = ({ onReport, onShare }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className={iconBtnClass}
        title={PLAYER_UI_COPY.more}
        aria-label={PLAYER_UI_COPY.moreActions}
      >
        <MoreHorizontal className="size-[18px]" strokeWidth={1.75} />
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      side="top"
      sideOffset={10}
      className={cn(panelClass, 'min-w-[196px]')}
    >
      <button
        type="button"
        onClick={onReport}
        className="flex w-full items-center gap-x-[12px] rounded-[10px] px-[10px] py-[10px] text-left text-[13px] font-medium text-white/85 hover:bg-white/[0.05]"
      >
        <Flag className="size-[16px] text-white/45" strokeWidth={1.75} />
        {PLAYER_UI_COPY.reportError}
      </button>
      <button
        type="button"
        onClick={onShare}
        className="flex w-full items-center gap-x-[12px] rounded-[10px] px-[10px] py-[10px] text-left text-[13px] font-medium text-white/85 hover:bg-white/[0.05]"
      >
        <Share2 className="size-[16px] text-white/45" strokeWidth={1.75} />
        {PLAYER_UI_COPY.share}
      </button>
      <WatchListButton menuItem />
    </PopoverContent>
  </Popover>
);

const EpisodeNav: React.FC<{
  withLabels?: boolean;
  canPrev: boolean;
  canNext: boolean;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}> = ({ withLabels = false, canPrev, canNext, disabled, onPrev, onNext }) => (
  <div className="flex items-center gap-[2px]">
    <button
      type="button"
      onClick={onPrev}
      disabled={disabled || !canPrev}
      title={disabled ? PLAYER_UI_COPY.hostLockedPrev : PLAYER_UI_COPY.prevEpisode}
      aria-label={PLAYER_UI_COPY.prevEpisode}
      className={withLabels ? textNavClass : iconBtnClass}
    >
      <ChevronLeft className="size-[18px]" strokeWidth={1.75} />
      {withLabels ? <span>{PLAYER_UI_COPY.prevShort}</span> : null}
    </button>
    <button
      type="button"
      onClick={onNext}
      disabled={disabled || !canNext}
      title={disabled ? PLAYER_UI_COPY.hostLockedNext : PLAYER_UI_COPY.nextEpisode}
      aria-label={PLAYER_UI_COPY.nextEpisode}
      className={withLabels ? textNavClass : iconBtnClass}
    >
      {withLabels ? <span>{PLAYER_UI_COPY.nextShort}</span> : null}
      <ChevronRight className="size-[18px]" strokeWidth={1.75} />
    </button>
  </div>
);

const BarPlayer: React.FC<BarPlayerProps> = ({
  handleNext = () => {},
  handlePrev = () => {},
  episodeCount = 0,
  episodeName = '',
  disabled = false,
  isWatchParty = false,
  isHost = true,
}) => {
  // Do NOT subscribe to `time.currentTime` — it updates every frame while playing and
  // would remount popovers / make the bar flicker.
  const { isLight, autoPlay, autoNext, isTheater, currentEpisode, filmName } = useVideoPlayerStore(
    useShallow((state) => ({
      isLight: state.statusMovie.isLight,
      autoPlay: state.statusMovie.autoPlay,
      autoNext: state.statusMovie.autoNext,
      isTheater: state.statusMovie.isTheater,
      currentEpisode: state.episode.currentEpisode,
      filmName: String(state.movie.movieData?.['name'] ?? ''),
    }))
  );

  const canPrev = currentEpisode > 0;
  const canNext = episodeCount > 0 && currentEpisode < episodeCount - 1;
  const episodeLabel = episodeName || `Tập ${currentEpisode + 1}`;
  const syncLocked = isWatchParty && !isHost;

  const handleSetStatus = <K extends keyof StatusMovie>(key: K, value: StatusMovie[K]) => {
    setStatusMovie({ key, value });
  };

  const handleLightOff = () => {
    if (isLight) handleSetStatus('isLight', false);
  };

  const readCurrentTime = () => Math.floor(useVideoPlayerStore.getState().time.currentTime);

  const handleReportError = () => {
    logger.warn('Player episode report', {
      film: filmName,
      episodeIndex: currentEpisode,
      episodeName: episodeLabel,
      currentTime: readCurrentTime(),
      href: typeof window !== 'undefined' ? window.location.href : '',
      reportedAt: new Date().toISOString(),
    });
    ToastMessage.success(PLAYER_UI_COPY.reportSuccess);
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('ep', String(currentEpisode + 1));
    const t = readCurrentTime();
    if (t > 0) url.searchParams.set('t', String(t));
    else url.searchParams.delete('t');

    const ok = await copyTextToClipboard(url.toString());
    if (ok) ToastMessage.success(PLAYER_UI_COPY.shareSuccess);
    else ToastMessage.error(PLAYER_UI_COPY.shareFailed);
  };

  const settingsProps = {
    isLight,
    autoPlay,
    autoNext,
    isTheater,
    syncLocked,
    isWatchParty,
    onSetStatus: handleSetStatus,
  };

  return (
    <div className="video-external-bar w-full px-[12px] detail769:px-[16px]">
      <ScreenDimmer
        onClick={handleLightOff}
        isShow={isLight}
        zIndexClassName={isWatchParty ? 'z-[40]' : 'z-[1001]'}
      />

      {/* Mobile */}
      <div className="flex h-[52px] w-full items-center justify-between detail769:hidden">
        <div className="flex items-center gap-[2px]">
          <SettingsPopover {...settingsProps} />
          <MorePopover onReport={handleReportError} onShare={() => void handleShare()} />
        </div>
        <div className="flex items-center gap-[8px]">
          <span className="text-[12px] tabular-nums text-white/40">
            {currentEpisode + 1}
            {episodeCount > 0 ? ` / ${episodeCount}` : ''}
          </span>
          <EpisodeNav
            canPrev={canPrev}
            canNext={canNext}
            disabled={disabled}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden h-[52px] w-full items-center justify-between detail769:flex">
        <div className="flex items-center gap-[2px]">
          <SettingsPopover {...settingsProps} />
          <button
            type="button"
            onClick={handleReportError}
            className={iconBtnClass}
            title={PLAYER_UI_COPY.reportEpisode}
            aria-label={PLAYER_UI_COPY.reportError}
          >
            <Flag className="size-[17px]" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className={iconBtnClass}
            title={PLAYER_UI_COPY.shareEpisodeLink}
            aria-label={PLAYER_UI_COPY.share}
          >
            <Share2 className="size-[17px]" strokeWidth={1.75} />
          </button>
          <WatchListButton iconOnly />
        </div>

        <div className="flex items-center gap-[16px]">
          <div className="text-right leading-tight">
            <p className="text-[13px] font-medium text-white/80">{episodeLabel}</p>
            {episodeCount > 0 ? (
              <p className="mt-[2px] text-[11px] tabular-nums text-white/35">
                {currentEpisode + 1} / {episodeCount}
              </p>
            ) : null}
          </div>
          <EpisodeNav
            withLabels
            canPrev={canPrev}
            canNext={canNext}
            disabled={disabled}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
};

export default BarPlayer;
