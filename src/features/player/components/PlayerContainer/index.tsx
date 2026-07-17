'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAuth } from '@/features/auth';
import type { FilmDataResponse, Episode, EpisodeServerData } from '@/features/film';
import { resolveFilmImageUrl } from '@/lib/film-detail';
import { cn } from '@/lib/utils';

import { CONTINUE_WATCHING_PROGRESS_MIN_S } from '../../constants/playback.constants';
import { useContinueWatchingTracker } from '../../hooks/useContinueWatchingTracker';
import { useVisibilityDisconnect } from '../../hooks/useVisibilityDisconnect';
import {
  useVideoPlayerStore,
  setCurrentEpisode,
  selectEpisode,
} from '../../store/video-player-store';

import DetailFilm from './DetailFilmPlayer';
import EpisodesPlayer from './EpisodesPlayer';
import VideoPlayer from './VideoPlayer';

const EMPTY_EPISODES: EpisodeServerData[] = [];

export interface PlayerProps {
  data?: FilmDataResponse | Record<string, unknown>;
  isWatchParty?: boolean;
  isChatOpen?: boolean;
  isHost?: boolean;
}

function resolveEpisodeIndex(
  episodes: EpisodeServerData[],
  preferredSlug: string | undefined,
  fallbackIndex: number
): number {
  if (preferredSlug) {
    const bySlug = episodes.findIndex((ep) => ep?.slug === preferredSlug);
    if (bySlug >= 0) return bySlug;
  }
  if (fallbackIndex >= 0 && fallbackIndex < episodes.length) return fallbackIndex;
  return 0;
}

const Player: React.FC<PlayerProps> = ({
  data = {},
  isWatchParty = false,
  isChatOpen = false,
  isHost = true,
}) => {
  const { isLogged, uid, continueWatching } = useAuth();

  const { isLight, isTheater } = useVideoPlayerStore(
    useShallow((state) => ({
      isLight: state.statusMovie.isLight,
      isTheater: state.statusMovie.isTheater,
    }))
  );
  const { currentEpisode } = useVideoPlayerStore(
    useShallow((state) => ({
      currentEpisode: state.episode.currentEpisode,
    }))
  );
  const { currentTime, duration } = useVideoPlayerStore(
    useShallow((state) => ({
      currentTime: state.time.currentTime,
      duration: state.time.duration,
    }))
  );

  const typedData = data as FilmDataResponse & Record<string, unknown>;
  const { episodes, movie } = typedData;
  const { thumb_url, poster_url, name } = movie || {};
  const heroImage = resolveFilmImageUrl(thumb_url || poster_url);

  const servers = useMemo<Episode[]>(
    () =>
      Array.isArray(episodes)
        ? episodes.filter((s) => Array.isArray(s?.server_data) && s.server_data.length > 0)
        : [],
    [episodes]
  );

  const [activeServerIndex, setActiveServerIndex] = useState(0);

  useEffect(() => {
    setActiveServerIndex(0);
  }, [movie?.slug]);

  const safeServerIndex =
    servers.length === 0 ? 0 : Math.min(activeServerIndex, servers.length - 1);

  const dataEpisodes = useMemo<EpisodeServerData[]>(
    () => servers[safeServerIndex]?.server_data ?? EMPTY_EPISODES,
    [servers, safeServerIndex]
  );

  useEffect(() => {
    // Clamp episode index if new server has fewer episodes
    if (dataEpisodes.length === 0) return;
    if (currentEpisode >= dataEpisodes.length) {
      setCurrentEpisode(Math.max(0, dataEpisodes.length - 1));
    }
  }, [dataEpisodes, currentEpisode]);

  const handleServerChange = useCallback(
    (nextIndex: number) => {
      if (nextIndex === safeServerIndex) return;
      const nextServer = servers[nextIndex];
      if (!nextServer?.server_data?.length) return;

      const currentSlug = dataEpisodes[currentEpisode]?.slug;
      const nextEpisodeIndex = resolveEpisodeIndex(
        nextServer.server_data,
        currentSlug,
        currentEpisode
      );

      setActiveServerIndex(nextIndex);
      selectEpisode(nextEpisodeIndex);
    },
    [servers, safeServerIndex, dataEpisodes, currentEpisode]
  );

  const { handleDisconnect } = useContinueWatchingTracker({
    movie,
    dataEpisodes,
    currentEpisode,
    currentTime,
    duration,
    uid,
    isLogged,
    continueWatching: continueWatching || [],
    enabled: !isWatchParty,
  });

  useVisibilityDisconnect({
    isLogged,
    hasWatchingData: () => Boolean(movie),
    hasProgress: () => currentTime > CONTINUE_WATCHING_PROGRESS_MIN_S,
    onDisconnect: handleDisconnect,
    enabled: !isWatchParty,
  });

  const shouldApply3Col = (!isWatchParty || !isChatOpen) && !isTheater;

  if (isWatchParty) {
    return (
      <div className="relative w-full h-full bg-black">
        <VideoPlayer
          dataEpisodes={dataEpisodes}
          dataMovie={movie}
          isWatchParty={true}
          isHost={isHost}
        />
      </div>
    );
  }

  return (
    <div className="relative px-[15px]">
      <div
        className={cn(
          'mx-auto',
          shouldApply3Col
            ? '2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm'
            : 'w-full max-w-[1920px]'
        )}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            style={{
              backgroundImage: heroImage ? `url(${heroImage})` : undefined,
              filter: 'blur(20px)',
            }}
            className="w-[100%] h-full bg-no-repeat bg-cover bg-center opacity-60"
          />
        </div>
        <div className="relative pt-[20px] pb-[50px] slm:pt-0 2xlm:pb-[20px] slm:pb-[10px]">
          <div className="slm:hidden mb-[16px]">
            <p className="text-[12px] font-normal text-primary">
              <span>Bạn đang xem</span>
              <span className="mx-[5px]">&bull;</span>
              <span>{name}</span>
              <span className="mx-[5px]">&bull;</span>
              <span>{dataEpisodes?.[currentEpisode]?.name || ''}</span>
              {servers[safeServerIndex]?.server_name ? (
                <>
                  <span className="mx-[5px]">&bull;</span>
                  <span>{servers[safeServerIndex].server_name}</span>
                </>
              ) : null}
            </p>
          </div>
          <div
            className={cn(
              'relative w-full',
              isLight && 'player-light-stage',
              isTheater && 'player-theater-stage'
            )}
            data-testid="player"
          >
            <div className="relative w-full flex flex-col">
              <div className={cn('relative h-fit w-full', shouldApply3Col && 'player3col:w-[75%]')}>
                {isWatchParty && !isHost && (
                  <div className="absolute inset-0 z-[50]" title="Điều khiển video · theo Host" />
                )}
                <VideoPlayer dataEpisodes={dataEpisodes} dataMovie={movie} />
                {!isWatchParty && (
                  <EpisodesPlayer
                    dataEpisodes={dataEpisodes}
                    servers={servers}
                    activeServerIndex={safeServerIndex}
                    onServerChange={handleServerChange}
                  />
                )}
              </div>
              <div
                className={cn(
                  'detail-film-scroll relative z-auto w-full min-h-0 overflow-visible',
                  'py-[35px] clm:py-[25px] px-[15px]',
                  shouldApply3Col &&
                    'player3col:absolute player3col:top-0 player3col:right-0 player3col:bottom-0 player3col:z-[1] player3col:w-[25%] player3col:min-h-0 player3col:overflow-y-auto player3col:overflow-x-hidden player3col:overscroll-y-contain player3col:pl-[30px] player3col:pr-[8px] player3col:py-0 player3col:px-0 player3col:pl-4',
                  isTheater && 'player3col:hidden'
                )}
                role="region"
                aria-label="Thông tin phim"
              >
                <DetailFilm dataMovie={movie} slug={movie?.slug} isWatchParty={isWatchParty} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
