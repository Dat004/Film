'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import { PlayIconCustom } from '@/icons';
import { cn } from '@/lib/utils';

import { usePlaybackIntent } from '../../../hooks/usePlaybackIntent';
import { usePlayerUrlState } from '../../../hooks/usePlayerUrlState';
import { syncEpisodeQueryToWindow } from '../../../lib/player-url';
import {
  useVideoPlayerStore,
  selectEpisode,
  setStatusMovie,
} from '../../../store/video-player-store';

import BarPlayer from './BarPlayer';

const Video = dynamic(() => import('../../Video'), { ssr: false });

export interface VideoPlayerProps {
  dataEpisodes?: any[];
  dataMovie?: any;
  isWatchParty?: boolean;
  isHost?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  dataEpisodes = [],
  dataMovie = {},
  isWatchParty = false,
  isHost = true,
}) => {
  const playbackLocked = isWatchParty && !isHost;
  const [showPoster, setShowPoster] = useState(true);
  // Prevent repeated autoplay attempts on the initial episode.
  const didInitialPlayRef = React.useRef(false);

  const { autoPlay, isTheater, isLight } = useVideoPlayerStore(
    useShallow((state) => ({
      autoPlay: state.statusMovie.autoPlay,
      isTheater: state.statusMovie.isTheater,
      isLight: state.statusMovie.isLight,
    }))
  );

  const currentEpisode = useVideoPlayerStore((state) => state.episode.currentEpisode);
  const episodeCount = dataEpisodes?.length ?? 0;
  const episodeName = dataEpisodes[currentEpisode]?.name ?? '';
  const { thumb_url, poster_url } = dataMovie;
  const filmKey = String(dataMovie?._id ?? dataMovie?.slug ?? '');

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const { requestPlay, requestPause, onMediaReady } = usePlaybackIntent({
    videoRef,
    playbackLocked,
    setShowPoster,
  });

  const { hasResumeTime } = usePlayerUrlState({
    episodeCount,
    filmKey,
    enabled: !isWatchParty,
  });

  // Host sync owns play/poster in watch-party mode.
  useEffect(() => {
    if (!isWatchParty) return;
    setShowPoster(false);
    setStatusMovie({ key: 'isTheater', value: false });
  }, [isWatchParty]);

  const prevEpisodeRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (isWatchParty) return;

    const isEpisodeChange =
      prevEpisodeRef.current !== null && prevEpisodeRef.current !== currentEpisode;
    prevEpisodeRef.current = currentEpisode;

    if (!isEpisodeChange && didInitialPlayRef.current) return;

    setStatusMovie({ key: 'isPlay', value: false });

    // A resume URL takes precedence over the autoplay preference.
    if (hasResumeTime && !didInitialPlayRef.current) {
      setShowPoster(false);
      requestPlay('resume');
    } else if (autoPlay) {
      setShowPoster(false);
      requestPlay('autoplay');
    } else {
      setShowPoster(true);
    }

    didInitialPlayRef.current = true;
  }, [currentEpisode, autoPlay, isWatchParty, requestPlay]);

  const prevAutoPlayRef = React.useRef(autoPlay);
  useEffect(() => {
    const wasOff = !prevAutoPlayRef.current;
    prevAutoPlayRef.current = autoPlay;
    if (!autoPlay || !wasOff) return;
    if (!isWatchParty && showPoster) {
      requestPlay('autoplay');
    }
  }, [autoPlay, isWatchParty, showPoster, requestPlay]);

  const handlePlayVideo = useCallback(() => {
    requestPlay('user');
  }, [requestPlay]);

  const handleNextEpisode = useCallback(() => {
    if (currentEpisode >= episodeCount - 1) {
      setStatusMovie({ key: 'isPlay', value: false });
      return;
    }
    const next = currentEpisode + 1;
    selectEpisode(next);
    syncEpisodeQueryToWindow(next);
    // auto-next ignores the autoPlay toggle
    requestPlay('auto-next');
  }, [currentEpisode, episodeCount, requestPlay]);

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode <= 0) return;
    const prev = currentEpisode - 1;
    selectEpisode(prev);
    syncEpisodeQueryToWindow(prev);
    if (autoPlay) requestPlay('autoplay');
  }, [currentEpisode, autoPlay, requestPlay]);

  return (
    <div
      className={cn(
        'relative w-[100%] slm:w-[100%] 2xlm:w-[100%] slm:pl-0',
        isWatchParty || isTheater ? 'pl-0' : 'pl-[300px]',
        isWatchParty && isLight && 'z-[60]'
      )}
    >
      <div className="relative">
        <div className="relative z-[5] overflow-visible pb-[56.25%] 2xls:pb-[460px] 2xlm:pb-[56.25%] slm:pb-[56.25%] h-0 leading-0">
          {showPoster ? (
            <div className="absolute inset-0 z-[100]">
              <div
                style={{
                  backgroundImage: `url(${thumb_url || poster_url})`,
                }}
                className={cn(
                  'relative bg-bg-layout w-[100%] h-full bg-center bg-no-repeat z-[50]',
                  thumb_url ? 'bg-cover' : 'bg-contain'
                )}
              />
              <FlexContainer className="absolute inset-0 items-center justify-center z-[120]">
                <FlexItems>
                  <PlayIconCustom className="block size-8 shrink-0" onClick={handlePlayVideo} />
                </FlexItems>
              </FlexContainer>
            </div>
          ) : (
            <div className="absolute backdrop-blur-[20px] bg-[var(--bg-video-overlay)] inset-0 z-[120] overflow-visible">
              <Video
                src={dataEpisodes[currentEpisode]?.link_m3u8}
                handleNext={handleNextEpisode}
                playbackLocked={playbackLocked}
                videoRef={videoRef}
                onMediaReady={onMediaReady}
              />
            </div>
          )}
        </div>
        <div className="video-external-controls video-player-chrome relative z-[10] bg-[#08090b]">
          <BarPlayer
            handleNext={playbackLocked ? () => {} : handleNextEpisode}
            handlePrev={playbackLocked ? () => {} : handlePrevEpisode}
            episodeCount={episodeCount}
            episodeName={episodeName}
            disabled={playbackLocked}
            isWatchParty={isWatchParty}
            isHost={isHost}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
