'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { EffectCards } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-cards';
import { cn } from '@/lib/utils';

import type { GallerySlide } from '../../types/film.types';
import { GALLERY_SLIDE_SPEED_MS } from '../../types/film.types';

function GalleryCard({
  slide,
  label,
  onOpen,
}: {
  slide: GallerySlide;
  label: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className="relative block h-full w-full overflow-hidden rounded-[14px] bg-bg-sidebar ring-1 ring-bd-filed-form-color"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </button>
  );
}

export interface GalleryCardsSwiperProps {
  filmSlug: string;
  filmTitle: string;
  slides: GallerySlide[];
  isPosterRail: boolean;
  isLoading: boolean;
  hasImages: boolean;
  backdropCount: number;
  posterCount: number;
  reduceMotion: boolean;
  onActiveIndexChange: (index: number) => void;
  onOpenLightbox: (index: number, trigger: HTMLElement | null) => void;
}

export default function GalleryCardsSwiper({
  filmSlug,
  filmTitle,
  slides,
  isPosterRail,
  isLoading,
  hasImages,
  backdropCount,
  posterCount,
  reduceMotion,
  onActiveIndexChange,
  onOpenLightbox,
}: GalleryCardsSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const slideSpeed = reduceMotion ? 0 : GALLERY_SLIDE_SPEED_MS;

  return (
    <div className="min-w-0 w-full md:w-[min(52%,560px)] md:shrink-0">
      <div className="flex items-baseline justify-between gap-[8px] mb-[14px]">
        <h3 className="text-[14px] font-semibold text-primary">
          {isPosterRail ? 'Poster' : 'Khung hình'}
        </h3>
        {!isLoading && hasImages ? (
          <span className="text-[11px] text-secondary">
            {backdropCount} BD · {posterCount} PS
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex min-h-[480px] items-center justify-center py-[32px]">
          <div
            className={cn(
              'rounded-[16px] bg-fill-secondary/80 animate-pulse',
              isPosterRail ? 'h-[420px] w-[280px]' : 'h-[240px] w-[380px]'
            )}
          />
        </div>
      ) : slides.length > 0 ? (
        <div className="relative flex min-h-[480px] w-full items-center justify-center px-[56px] py-[32px]">
          <Swiper
            key={`${filmSlug}-${slides.length}-${reduceMotion ? 'rm' : 'm'}`}
            onSwiper={(instance) => {
              swiperRef.current = instance;
            }}
            onSlideChange={(instance) => onActiveIndexChange(instance.activeIndex)}
            effect={reduceMotion ? 'slide' : 'cards'}
            grabCursor
            speed={slideSpeed}
            modules={reduceMotion ? [] : [EffectCards]}
            cardsEffect={{
              perSlideOffset: 12,
              perSlideRotate: 4,
              rotate: true,
              slideShadows: true,
            }}
            className={cn(
              'gallery-cards-swiper !overflow-visible drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]',
              isPosterRail
                ? '!h-[min(70vw,420px)] !w-[min(48vw,280px)]'
                : '!h-[min(42vw,250px)] !w-[min(78vw,360px)]'
            )}
          >
            {slides.map((slide, idx) => (
              <SwiperSlide
                key={`${slide.kind}-${idx}-${slide.url}`}
                className="!overflow-hidden !rounded-[16px] !bg-bg-sidebar"
              >
                <GalleryCard
                  slide={slide}
                  label={filmTitle ? `Xem poster ${idx + 1} — ${filmTitle}` : `Xem ảnh ${idx + 1}`}
                  onOpen={() => onOpenLightbox(idx, document.activeElement as HTMLElement | null)}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Slide trước"
                onClick={() => swiperRef.current?.slidePrev(slideSpeed)}
                className="absolute left-0 top-1/2 z-20 flex h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-bd-filed-form-color bg-bg-sidebar/90 text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-bg-sidebar"
              >
                <ChevronLeft className="h-[26px] w-[26px] stroke-[1.25]" />
              </button>
              <button
                type="button"
                aria-label="Slide sau"
                onClick={() => swiperRef.current?.slideNext(slideSpeed)}
                className="absolute right-0 top-1/2 z-20 flex h-[42px] w-[42px] -translate-y-1/2 items-center justify-center rounded-full border border-bd-filed-form-color bg-bg-sidebar/90 text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-bg-sidebar"
              >
                <ChevronRight className="h-[26px] w-[26px] stroke-[1.25]" />
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <p className="text-[12px] text-secondary py-[12px]">Chưa có ảnh gallery.</p>
      )}
    </div>
  );
}
