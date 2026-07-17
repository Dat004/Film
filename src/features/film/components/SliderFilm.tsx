'use client';

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import Button from '@/components/ui/Button';
import HeaderContainer from '@/components/ui/Container/HeaderContainer';

import {
  DEFAULT_SLIDER_FILM_BREAKPOINTS,
  DENSE_SLIDER_FILM_BREAKPOINTS,
  SLIDER_DEFAULT_SPACE_BETWEEN,
  type SliderFilmBreakpoints,
} from '../constants/slider.constants';
import { setShowPreview } from '../store/preview-film-store';
import type { Film } from '../types/film.types';

import FilmElement from './FilmElement';

import { ChevronRight, ChevronLeft } from 'lucide-react';

export type { SliderFilmBreakpoints };
export { DEFAULT_SLIDER_FILM_BREAKPOINTS, DENSE_SLIDER_FILM_BREAKPOINTS };

export interface SliderFilmProps {
  value?: {
    items?: Partial<Film>[];
    data?: {
      titlePage?: string;
      type_list?: string;
      items?: Partial<Film>[];
      APP_DOMAIN_CDN_IMAGE?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  title?: string;
  to?: string;
  /** Optional min-width breakpoints for slide count. */
  breakpoints?: SliderFilmBreakpoints;
  /** Space between slides in pixels. */
  spaceBetween?: number;
}

function resolveSlidesPerView(width: number, bps: SliderFilmBreakpoints): number {
  const mins = Object.keys(bps)
    .map(Number)
    .sort((a, b) => a - b);
  let value = bps[mins[0]!]?.slidesPerView ?? 1.15;
  for (const min of mins) {
    if (width >= min) value = bps[min]!.slidesPerView;
  }
  return value;
}

/** Placeholder that matches the measured responsive breakpoint. */
function SliderFilmPlaceholder() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-hidden>
      <div className="w-[82%] shrink-0 sm:hidden">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>
      <div className="w-[82%] shrink-0 sm:hidden">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>

      <div className="hidden min-w-0 w-[calc((100%-12px)/2.1)] shrink-0 sm:block lg:hidden">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>
      <div className="hidden min-w-0 w-[calc((100%-12px)/2.1)] shrink-0 sm:block lg:hidden">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>
      <div className="hidden min-w-0 w-[calc((100%-12px)/2.1)] shrink-0 sm:block lg:hidden">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>

      <div className="hidden min-w-0 w-[calc((100%-24px)/3)] shrink-0 lg:block">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>
      <div className="hidden min-w-0 w-[calc((100%-24px)/3)] shrink-0 lg:block">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>
      <div className="hidden min-w-0 w-[calc((100%-24px)/3)] shrink-0 lg:block">
        <div className="aspect-video w-full rounded-[12px] bg-white/[0.06] ring-1 ring-white/10" />
      </div>
    </div>
  );
}

const SliderFilm: React.FC<SliderFilmProps> = ({
  value = {},
  title = '',
  to = '',
  breakpoints = DEFAULT_SLIDER_FILM_BREAKPOINTS,
  spaceBetween = SLIDER_DEFAULT_SPACE_BETWEEN,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  // Wait for the first layout measurement before mounting Swiper.
  const [slidesPerView, setSlidesPerView] = useState<number | null>(null);

  const cdnBase = value?.data?.APP_DOMAIN_CDN_IMAGE;
  const films = useMemo(() => {
    if (value?.items?.length) return value.items;
    if (value?.data?.items?.length) return value.data.items;
    return [];
  }, [value?.items, value?.data?.items]);

  useLayoutEffect(() => {
    const sync = () => {
      const next = resolveSlidesPerView(window.innerWidth, breakpoints);
      setSlidesPerView((prev) => (prev === next ? prev : next));
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [breakpoints]);

  const hidePreview = () => setShowPreview(false);

  const handleNextSlide = () => {
    hidePreview();
    swiperRef.current?.slideNext(400);
  };

  const handlePrevSlide = () => {
    hidePreview();
    swiperRef.current?.slidePrev(400);
  };

  if (!films.length) return null;

  const header = (
    <HeaderContainer
      title={title || value?.data?.titlePage || ''}
      to={to || value?.data?.type_list || ''}
      isShowAll
    />
  );

  if (slidesPerView == null) {
    return (
      <div className="relative group/cards select-none">
        {header}
        <SliderFilmPlaceholder />
      </div>
    );
  }

  return (
    <div className="relative group/cards select-none">
      {header}
      <div className="relative">
        <Swiper
          key={`spv-${slidesPerView}`}
          modules={[FreeMode]}
          mousewheel={false}
          freeMode={{
            enabled: true,
            sticky: false,
            momentum: true,
            momentumRatio: 0.35,
            momentumVelocityRatio: 0.35,
            minimumVelocity: 0.15,
          }}
          threshold={10}
          // Use the measured value to avoid a mobile-sized first frame on desktop.
          slidesPerView={slidesPerView}
          spaceBetween={spaceBetween}
          loop={false}
          rewind={films.length > 2}
          preventClicks={false}
          preventClicksPropagation={false}
          touchStartPreventDefault={false}
          watchOverflow
          observer
          observeParents
          onSwiper={(instance) => {
            swiperRef.current = instance;
          }}
          onSliderMove={hidePreview}
          className="!overflow-hidden"
        >
          {films.map((items, index) => (
            <SwiperSlide key={items?._id || items?.slug || index} className="!h-auto">
              <FilmElement data={items} baseUrl={cdnBase} imagePriority={index < 3} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-[8%] bg-bg-linear-to-left opacity-0 transition-opacity duration-500 group-hover/cards:opacity-100 mdm:opacity-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[8%] bg-bg-linear-to-right opacity-0 transition-opacity duration-500 group-hover/cards:opacity-100 mdm:opacity-100"
        />

        <div
          role="button"
          tabIndex={0}
          onClick={handleNextSlide}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNextSlide();
          }}
          className="absolute inset-y-0 right-0 z-10 hidden w-[6%] cursor-pointer items-center justify-center opacity-0 transition-opacity duration-500 group-hover/cards:opacity-100 detail769:flex"
        >
          <Button
            aria-label="next-btn"
            onClick={handleNextSlide}
            className="text-[30px] !text-primary [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]"
          >
            <ChevronRight />
          </Button>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={handlePrevSlide}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handlePrevSlide();
          }}
          className="absolute inset-y-0 left-0 z-10 hidden w-[6%] cursor-pointer items-center justify-center opacity-0 transition-opacity duration-500 group-hover/cards:opacity-100 detail769:flex"
        >
          <Button
            aria-label="prev-btn"
            onClick={handlePrevSlide}
            className="text-[30px] !text-primary [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]"
          >
            <ChevronLeft />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SliderFilm;
