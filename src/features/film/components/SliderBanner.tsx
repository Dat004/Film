'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import Button from '@/components/ui/Button';
import { extractYoutubeVideoId, resolveFilmImageUrl } from '@/lib/film-detail';

import {
  BANNER_AUTOPLAY_MS,
  BANNER_SLIDE_SPEED_MS,
  BANNER_TRAILER_DELAY_MS,
  BANNER_REDUCED_MOTION_SLIDE_MS,
  BANNER_POINTER_LEAVE_DEBOUNCE_MS,
  BANNER_TRANSITION_MODE,
  type BannerTransitionMode,
} from '../constants/banner.constants';
import { useBannerFilmDetail } from '../hooks/useBannerFilmDetail';
import { useBannerTrailerAutoplay } from '../hooks/useBannerTrailerAutoplay';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import type { Film } from '../types/film.types';

import BannerInfo from './BannerInfo';
import BannerMedia from './BannerMedia';

import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface SliderBannerProps {
  data?: {
    APP_DOMAIN_CDN_IMAGE?: string;
    itemsBanner?: Partial<Film>[] | null;
    [key: string]: unknown;
  };
}

export type { BannerTransitionMode };
export { BANNER_TRANSITION_MODE };

function usesBannerFade(mode: BannerTransitionMode): boolean {
  return mode !== 'slide';
}

const SliderBanner: React.FC<SliderBannerProps> = ({ data = {} }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const leaveTimerRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const isHoveringRef = useRef(false);
  const reduceMotion = usePrefersReducedMotion();

  const { APP_DOMAIN_CDN_IMAGE, itemsBanner } = data;
  const slideCount = itemsBanner?.length ?? 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [pointerOnBanner, setPointerOnBanner] = useState(false);
  const [slideDir, setSlideDir] = useState<'next' | 'prev'>('next');

  const activeFilm = itemsBanner?.[activeIndex];
  const activeSlug = activeFilm?.slug || String(activeIndex);
  const { detail } = useBannerFilmDetail(activeFilm?.slug, Boolean(activeFilm?.slug));
  const trailerId = extractYoutubeVideoId(detail?.trailer_url || null);

  const trailer = useBannerTrailerAutoplay(trailerId, pointerOnBanner, BANNER_TRAILER_DELAY_MS);
  const shouldPlayTrailerRef = useRef(false);
  shouldPlayTrailerRef.current = trailer.shouldPlayTrailer;

  // Only non-slide modes use the fade effect.
  const useFade = !reduceMotion && usesBannerFade(BANNER_TRANSITION_MODE);
  const slideSpeed = reduceMotion ? BANNER_REDUCED_MOTION_SLIDE_MS : BANNER_SLIDE_SPEED_MS;

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const markPointerInside = () => {
    clearLeaveTimer();
    isHoveringRef.current = true;
    setPointerOnBanner(true);
  };

  const confirmPointerLeave = () => {
    clearLeaveTimer();
    isHoveringRef.current = false;
    lastPointerRef.current = null;
    setPointerOnBanner(false);
  };

  const schedulePointerLeave = () => {
    clearLeaveTimer();
    leaveTimerRef.current = window.setTimeout(() => {
      confirmPointerLeave();
    }, BANNER_POINTER_LEAVE_DEBOUNCE_MS);
  };

  const recheckPointerOverBanner = () => {
    if (!isHoveringRef.current && !leaveTimerRef.current) return;

    const root = rootRef.current;
    const pt = lastPointerRef.current;
    if (!root || !pt) {
      if (!isHoveringRef.current) confirmPointerLeave();
      return;
    }

    const under = document.elementFromPoint(pt.x, pt.y);
    if (under && root.contains(under)) {
      markPointerInside();
      return;
    }
    confirmPointerLeave();
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [slideCount]);

  useEffect(() => {
    return () => clearLeaveTimer();
  }, []);

  // Rewind avoids the fade/loop state getting stuck after a trailer pause.
  useEffect(() => {
    const swiper = swiperRef.current;
    const autoplay = swiper?.autoplay;
    if (!autoplay) return;

    if (trailer.shouldPlayTrailer) {
      autoplay.stop();
      return;
    }

    autoplay.start();
  }, [trailer.shouldPlayTrailer, activeIndex]);

  const handleNextSlide = () => {
    swiperRef.current?.slideNext(slideSpeed);
  };

  const handlePrevSlide = () => {
    swiperRef.current?.slidePrev(slideSpeed);
  };

  const handleGoToSlide = (index: number) => {
    swiperRef.current?.slideTo(index, slideSpeed);
  };

  if (!itemsBanner?.length || !activeFilm) return null;

  const firstThumb =
    resolveFilmImageUrl(activeFilm?.thumb_url, APP_DOMAIN_CDN_IMAGE) ||
    resolveFilmImageUrl(activeFilm?.poster_url, APP_DOMAIN_CDN_IMAGE);

  const fadeClassByMode: Partial<Record<BannerTransitionMode, string>> = {
    'crossfade-parallax': 'banner-swiper--crossfade-parallax',
    'depth-dissolve': 'banner-swiper--depth-dissolve',
  };

  const swiperClassName = [
    'banner-swiper relative z-[1] h-full min-h-[360px] mdm:min-h-0',
    useFade ? (fadeClassByMode[BANNER_TRANSITION_MODE] ?? '') : '',
    reduceMotion ? 'banner-swiper--reduced' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const canCycle = slideCount > 1;

  return (
    <div
      ref={rootRef}
      data-banner-dir={slideDir}
      className="relative flex min-h-[360px] w-full flex-row overflow-hidden rounded-[12px] ring-1 ring-white/10 bg-bg-block select-none mdm:min-h-0 mdm:flex-col"
      onPointerEnter={markPointerInside}
      onPointerLeave={schedulePointerLeave}
      onPointerMove={(e) => {
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        markPointerInside();
      }}
      onMouseEnter={markPointerInside}
      onMouseLeave={schedulePointerLeave}
    >
      <div className="relative w-[58%] shrink-0 self-stretch min-h-[360px] mdm:w-full mdm:min-h-0">
        {firstThumb ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center mdm:hidden"
            style={{ backgroundImage: `url(${firstThumb})` }}
          />
        ) : null}

        <Swiper
          modules={useFade ? [Autoplay, EffectFade] : [Autoplay]}
          effect={useFade ? 'fade' : 'slide'}
          {...(useFade ? { fadeEffect: { crossFade: true } } : {})}
          autoplay={
            canCycle
              ? {
                  delay: BANNER_AUTOPLAY_MS,
                  disableOnInteraction: false,
                  // Trailer playback controls the banner pause state.
                  pauseOnMouseEnter: false,
                  stopOnLastSlide: false,
                  waitForTransition: true,
                }
              : false
          }
          speed={slideSpeed}
          slidesPerView={1}
          // Rewind is more reliable than loop with the fade effect.
          loop={false}
          rewind={canCycle}
          allowTouchMove
          watchOverflow={false}
          className={swiperClassName}
          onSwiper={(instance) => {
            swiperRef.current = instance;
            if (canCycle && !shouldPlayTrailerRef.current) {
              instance.autoplay?.start();
            }
          }}
          onSlideChange={(instance) => {
            const wentPrev =
              instance.swipeDirection === 'prev' ||
              (instance.previousIndex != null &&
                instance.activeIndex < instance.previousIndex &&
                !(instance.previousIndex === 0 && instance.activeIndex > 0));
            setSlideDir(wentPrev ? 'prev' : 'next');
            setActiveIndex(instance.realIndex);
            window.requestAnimationFrame(() => {
              window.setTimeout(recheckPointerOverBanner, 50);
            });
          }}
          onSlideChangeTransitionEnd={(instance) => {
            recheckPointerOverBanner();
            if (!shouldPlayTrailerRef.current) {
              instance.autoplay?.start();
            }
          }}
        >
          {itemsBanner.map((item, index) => (
            <SwiperSlide key={item?._id || item?.slug || index}>
              <BannerMedia
                data={item}
                baseUrl={APP_DOMAIN_CDN_IMAGE ?? ''}
                isActive={item?.slug === activeFilm.slug}
                trailerId={item?.slug === activeFilm.slug ? trailerId : null}
                shouldPlayTrailer={trailer.shouldPlayTrailer}
                trailerFailed={trailer.trailerFailed}
                onTrailerIframeLoad={trailer.onIframeLoad}
                transitionMode={BANNER_TRANSITION_MODE}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {canCycle ? (
          <div className="pointer-events-none absolute bottom-[14px] right-[16px] z-20 flex items-center gap-[6px]">
            {itemsBanner.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item?._id || item?.slug || index}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  aria-current={isActive}
                  onClick={() => handleGoToSlide(index)}
                  className={`pointer-events-auto h-[6px] shrink-0 rounded-full bg-white transition-all duration-300 ease-out ${
                    isActive ? 'w-[28px] opacity-100' : 'w-[14px] opacity-40 hover:opacity-70'
                  }`}
                />
              );
            })}
          </div>
        ) : null}

        {canCycle ? (
          <section className="absolute inset-0 pointer-events-none">
            <div
              onClick={handlePrevSlide}
              className="absolute left-0 top-0 group/btn z-10 flex h-full cursor-pointer items-center justify-center pointer-events-auto"
            >
              <Button
                aria-label="prev-btn"
                onClick={handlePrevSlide}
                className="text-[36px] sm:text-[40px] !text-white opacity-0 transition-opacity group-hover/btn:opacity-70 hover:!text-white hover:opacity-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
              >
                <ChevronLeft />
              </Button>
            </div>
            <div
              onClick={handleNextSlide}
              className="absolute right-0 top-0 group/btn z-10 flex h-full cursor-pointer items-center justify-center pointer-events-auto"
            >
              <Button
                aria-label="next-btn"
                onClick={handleNextSlide}
                className="text-[36px] sm:text-[40px] !text-white opacity-0 transition-opacity group-hover/btn:opacity-70 hover:!text-white hover:opacity-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
              >
                <ChevronRight />
              </Button>
            </div>
          </section>
        ) : null}
      </div>

      <div className="relative flex min-h-[360px] flex-grow-0 flex-shrink-0 w-[42%] flex-col mdm:min-h-0 mdm:w-full">
        <BannerInfo
          data={activeFilm}
          detail={detail}
          trailerId={trailerId}
          transitionKey={activeSlug}
          slideDir={slideDir}
        />
      </div>
    </div>
  );
};

export default SliderBanner;
