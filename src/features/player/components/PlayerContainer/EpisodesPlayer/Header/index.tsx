'use client';

import { Menu, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import type { Episode } from '@/features/film/types/film.types';

import { PLAYER_UI_COPY } from '../../../../constants/player-ui.constants';
import { useVideoPlayerStore } from '../../../../store/video-player-store';
import ServerTabs from '../ServerTabs';

import SelectMenuPartMovie from './SelectMenuPartMovie';

export interface HeaderProps {
  dataPartMovies?: any[][];
  searchEpisodeValue?: string;
  handleSelect?: (currentIndex: number) => void;
  handleSearchEpisodeValue?: (value: string) => void;
  servers?: Episode[];
  activeServerIndex?: number;
  onServerChange?: (index: number) => void;
}

const Header: React.FC<HeaderProps> = ({
  dataPartMovies = [],
  searchEpisodeValue = '',
  handleSelect = () => {},
  handleSearchEpisodeValue = () => {},
  servers = [],
  activeServerIndex = 0,
  onServerChange = () => {},
}) => {
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [episodeNumber, setEpisodeNumber] = useState({
    start: '',
    end: '',
    full: '',
  });

  const currentIndexSplitEpisodes = useVideoPlayerStore(
    (state) => state.episode.currentIndexSplitEpisodes
  );

  const handleClickOutsideMenu = () => {
    if (isShowMenu) setIsShowMenu(false);
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutsideMenu);

    return () => window.removeEventListener('click', handleClickOutsideMenu);
  }, [isShowMenu]);

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setIsShowMenu((state) => !state);
  };

  const handleChangeSearchEpisodeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    handleSearchEpisodeValue(value);
  };

  useEffect(() => {
    let start = '';
    let end = '';
    let full = '';

    dataPartMovies?.forEach((items, index) => {
      if (currentIndexSplitEpisodes === index) {
        const episodeStart = items[0]?.slug?.split('-')[1];
        const episodeEnd = items[items?.length - 1]?.slug?.split('-')[1];

        if (!episodeStart || !episodeEnd) {
          full = items[0]?.slug;
          return;
        }

        start = episodeStart;
        end = episodeEnd;
      }
    });

    setEpisodeNumber(() => ({
      start,
      end,
      full,
    }));
  }, [currentIndexSplitEpisodes, dataPartMovies]);

  return (
    <div className="py-[12px] bg-[var(--bg-episodes-header)]">
      <FlexContainer className="items-center px-[15px] mb-[8px] justify-between">
        <FlexItems className="!flex-shrink">
          <p className="text-[12px] text-primary font-medium">{PLAYER_UI_COPY.episodeListTitle}:</p>
        </FlexItems>
      </FlexContainer>
      <ServerTabs servers={servers} activeIndex={activeServerIndex} onChange={onServerChange} />
      <FlexContainer className="items-center">
        <FlexItems className="relative flex-grow w-[50%] px-[15px] flex-shrink-0">
          <FlexContainer className="gap-x-[16px] items-center">
            <FlexItems>
              <Button aria-label="menu-btn" aria-haspopup="menu" onClick={handleToggleMenu}>
                <Menu className="text-[18px]" />
              </Button>
            </FlexItems>
            <FlexItems>
              <p className="text-primary text-[12px]">
                {(episodeNumber.start || episodeNumber.end) && !episodeNumber.full ? (
                  <>
                    <span>{episodeNumber.start}</span>
                    <span>-</span>
                    <span>{episodeNumber.end}</span>
                  </>
                ) : (
                  <span className="capitalize">{episodeNumber.full}</span>
                )}
              </p>
            </FlexItems>
          </FlexContainer>
          <SelectMenuPartMovie
            isShowMenu={isShowMenu}
            currentPartMovie={currentIndexSplitEpisodes}
            dataMenuSelect={dataPartMovies}
            handleSelect={handleSelect}
          />
        </FlexItems>
        <FlexItems className="flex-grow w-[50%] px-[15px] flex-shrink-0">
          <FlexContainer className="text-primary ml-auto w-[100%] min-w-[100px] max-w-[250px] border border-solid border-bd-filed-form-color p-[4px] rounded-[4px] items-center">
            <FlexItems className="px-[3px]">
              <Search className="text-[14px]" />
            </FlexItems>
            <FlexItems className="text-[12px] !flex-grow-0 !flex-shrink px-[4px] text-primary font-normal">
              <input
                className="w-[100%]"
                type="text"
                placeholder={PLAYER_UI_COPY.findEpisodePlaceholder}
                value={searchEpisodeValue}
                onChange={handleChangeSearchEpisodeValue}
                name="episode"
              />
            </FlexItems>
          </FlexContainer>
        </FlexItems>
      </FlexContainer>
    </div>
  );
};

export default Header;
