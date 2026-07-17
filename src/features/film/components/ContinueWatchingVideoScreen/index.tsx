'use client';

import { X, Play, Inbox } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import Image from '@/components/ui/Image';

import { FILM_UI_COPY } from '../../constants/film-ui.constants';
import { useContinueWatchingActions } from '../../hooks/useContinueWatchingActions';
import type { ContinueWatchingCardItem } from '../../types/continue-watching.types';

import CurrentTime from './CurrentTime';

export interface ContinueWatchingVideoScreenProps {
  data?: ContinueWatchingCardItem[];
  uid?: string;
}

/** Encodes resume state in the URL to avoid sharing player state between films. */
function resumeHref(item: ContinueWatchingCardItem): string {
  const ep = (item.watching?.currentEpisode ?? item.episodeIndex ?? 0) + 1;
  const t = Math.floor(item.watching?.currentTime ?? item.currentTime ?? 0);
  const params = new URLSearchParams();
  if (ep > 0) params.set('ep', String(ep));
  if (t > 0) params.set('t', String(t));
  const qs = params.toString();
  return qs ? `/phim/${item.slug}?${qs}` : `/phim/${item.slug}`;
}

const ContinueWatchingVideoScreen: React.FC<ContinueWatchingVideoScreenProps> = ({
  data = [],
  uid = '',
}) => {
  const { removeItem } = useContinueWatchingActions(uid);

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={FILM_UI_COPY.continueWatchingEmptyTitle}
        description={FILM_UI_COPY.continueWatchingEmptyDescription}
      />
    );
  }

  return (
    <div className="w-[100%]">
      <FlexContainer className="!items-start !gap-y-[20px] mx-[-8px]" isWrap>
        {data.map((item) => {
          const href = resumeHref(item);
          return (
            <FlexItems
              key={item._id}
              className="w-[20%] clm:w-[25%] mdm:w-[calc(100%/3)] ccm:w-[50%] px-[8px]"
            >
              <div className="group/cards relative">
                <div className="opacity-0 slm:opacity-100 group-hover/cards:opacity-100 absolute top-[2.5%] right-[2.5%] flex items-center justify-center size-[25px] bg-bg-white rounded-[50%] z-[10]">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void removeItem(item._id);
                    }}
                    title={FILM_UI_COPY.removeFromContinueWatching}
                    className="!text-dark"
                  >
                    <X />
                  </Button>
                </div>
                <Link className="relative z-[5]" href={href}>
                  <section className="w-[100%] h-0 leading-0 pb-[140%] mb-[8px]">
                    <div className="absolute inset-0">
                      <Image cover src={item.poster_url} />
                    </div>
                    <div className="mdm:hidden opacity-0 group-hover/cards:opacity-100 flex items-center justify-center transition-opacity duration-200 absolute inset-0 z-10 backdrop-blur-[10px]">
                      <i className="text-[42px] text-primary">
                        <Play />
                      </i>
                    </div>
                  </section>
                </Link>
              </div>
              <h3 className="text-[14.3px] font-medium text-primary leading-[1.3] line-clamp-1 mb-[8px]">
                <Link href={href} className="whitespace-normal hover:opacity-80">
                  {item.name}
                </Link>
              </h3>
              <div>
                <FlexContainer className="items-baseline">
                  <FlexItems>
                    <span className="text-title text-[12px] font-bold uppercase">
                      {item.watching?.episode_info?.name ?? item.episodeName}
                    </span>
                  </FlexItems>
                  <FlexItems className="ml-auto !flex-grow-0 !flex-shrink">
                    <FlexContainer className="items-center">
                      <CurrentTime
                        className="!text-primary"
                        currentTime={item.watching?.currentTime ?? item.currentTime ?? 0}
                      />
                      <span className="text-title text-[16px] mx-[4px] font-medium">&#47;</span>
                      <CurrentTime currentTime={item.watching?.duration ?? item.duration ?? 0} />
                    </FlexContainer>
                  </FlexItems>
                </FlexContainer>
                <div className="relative h-[3px] bg-bg-slider-color my-[5px]">
                  <span
                    style={{
                      width: `calc(${
                        ((item.watching?.currentTime ?? item.currentTime ?? 0) /
                          Math.max(item.watching?.duration ?? item.duration ?? 1, 1)) *
                        100
                      }%)`,
                    }}
                    className="absolute left-0 top-0 h-[100%] bg-bg-green"
                  ></span>
                </div>
              </div>
            </FlexItems>
          );
        })}
      </FlexContainer>
    </div>
  );
};

export default ContinueWatchingVideoScreen;
