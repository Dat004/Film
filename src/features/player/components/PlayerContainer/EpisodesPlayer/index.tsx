'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { Episode } from '@/features/film/types/film.types';
import { useDebounce } from '@/hooks';
import { cn } from '@/lib/utils';

import { EPISODE_SEARCH_DEBOUNCE_MS } from '../../../constants/episode.constants';
import { PLAYER_UI_COPY } from '../../../constants/player-ui.constants';
import { chunkEpisodes } from '../../../lib/episode-chunk';
import { syncEpisodeQueryToWindow } from '../../../lib/player-url';
import {
  useVideoPlayerStore,
  selectEpisode,
  setCurrentIndexSplitEpisodes,
  setSplitEpisodes,
} from '../../../store/video-player-store';

import EpisodeItem from './EpisodeItem';
import Header from './Header';

export interface EpisodesPlayerProps {
  dataEpisodes?: any[];
  /** When true (e.g. non-host in a watch party), episode selection is locked. */
  disabled?: boolean;
  servers?: Episode[];
  activeServerIndex?: number;
  onServerChange?: (index: number) => void;
}

const EpisodesPlayer: React.FC<EpisodesPlayerProps> = ({
  dataEpisodes = [],
  disabled = false,
  servers = [],
  activeServerIndex = 0,
  onServerChange = () => {},
}) => {
  const [searchEpisodeValue, setSearchEpisodeValue] = useState('');
  const splitEpisodes = useVideoPlayerStore((state) => state.episode.splitEpisodes);
  const currentIndexSplitEpisodes = useVideoPlayerStore(
    (state) => state.episode.currentIndexSplitEpisodes
  );
  const currentEpisode = useVideoPlayerStore((state) => state.episode.currentEpisode);

  const episodeListKey = useMemo(
    () =>
      dataEpisodes.length > 0
        ? `${dataEpisodes.length}:${dataEpisodes[0]?.slug ?? ''}:${dataEpisodes[dataEpisodes.length - 1]?.slug ?? ''}`
        : '0',
    [dataEpisodes]
  );

  const searchEpisodeValueDebounce = useDebounce(searchEpisodeValue, EPISODE_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setSplitEpisodes(chunkEpisodes(dataEpisodes ?? []));
    // Re-chunk when episode list identity changes (length / boundary slugs).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeListKey]);

  useEffect(() => {
    if (searchEpisodeValueDebounce) {
      const getIndexPartMovie = splitEpisodes?.findIndex((items) =>
        items?.some((value) => {
          const part = value?.slug?.split('-')[1];
          return part !== undefined && part.includes(searchEpisodeValueDebounce);
        })
      );

      if (getIndexPartMovie === -1) {
        setCurrentIndexSplitEpisodes(0);

        return;
      }

      setCurrentIndexSplitEpisodes(getIndexPartMovie);
    }
  }, [searchEpisodeValueDebounce, splitEpisodes]);

  useEffect(() => {
    const searchEpisode = splitEpisodes.findIndex((item) =>
      item.some((value) =>
        value?.slug
          ?.split('-')[1]
          ?.includes(dataEpisodes?.[currentEpisode]?.slug?.split('-')[1] || '')
      )
    );

    if (searchEpisode === -1) {
      setCurrentIndexSplitEpisodes(0);

      return;
    }

    setCurrentIndexSplitEpisodes(searchEpisode);
  }, [splitEpisodes, currentEpisode, dataEpisodes]);

  const handleChangeCurrentPartMovie = useCallback((currentIndex: number) => {
    setCurrentIndexSplitEpisodes(currentIndex);
  }, []);

  const handleSearchEpisode = useCallback((ep: string) => {
    setSearchEpisodeValue(ep);
  }, []);

  const handleGetEpisode = (slug: string) => {
    if (disabled) return;
    const findEpisode = dataEpisodes?.findIndex((items) => items?.slug?.includes(slug));
    if (findEpisode == null || findEpisode < 0) return;
    selectEpisode(findEpisode);
    syncEpisodeQueryToWindow(findEpisode);
  };

  return (
    <div
      className={cn(
        'absolute w-[300px] slm:w-[100%] slm:relative left-0 top-0 h-full bg-bg-player',
        disabled && 'pointer-events-none select-none opacity-60'
      )}
      title={disabled ? PLAYER_UI_COPY.hostLockedEpisode : undefined}
    >
      {disabled && (
        <p className="absolute top-2 left-2 right-2 z-10 rounded-md bg-black/55 px-2 py-1 text-center text-[11px] text-white/85 pointer-events-none">
          {PLAYER_UI_COPY.hostLockedEpisode}
        </p>
      )}
      <div className="w-[100%] h-full overflow-hidden">
        <Header
          dataPartMovies={splitEpisodes}
          searchEpisodeValue={searchEpisodeValue}
          handleSelect={handleChangeCurrentPartMovie}
          handleSearchEpisodeValue={handleSearchEpisode}
          servers={servers}
          activeServerIndex={activeServerIndex}
          onServerChange={onServerChange}
        />
        <div className="w-[100%] max-h-[calc(100%-84px)] slm:max-h-[350px] mdm:max-h-[225px] overflow-auto">
          <>
            {splitEpisodes[currentIndexSplitEpisodes]?.map((items: any, index: number) => {
              const i = index;
              const isHadFound = +items?.slug?.split('-')[1] === +searchEpisodeValueDebounce;

              return (
                <EpisodeItem
                  data={items}
                  isHadFound={isHadFound}
                  currentEpisode={items?.slug === dataEpisodes?.[currentEpisode]?.slug}
                  isEven={i % 2 === 0}
                  isOdd={i % 2 !== 0}
                  onClick={() => handleGetEpisode(items?.slug)}
                  key={index}
                />
              );
            })}
          </>
        </div>
      </div>
    </div>
  );
};

export default EpisodesPlayer;
