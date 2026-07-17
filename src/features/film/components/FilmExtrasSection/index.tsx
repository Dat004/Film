'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFilmExtras } from '../../hooks/useFilmExtras';
import { useFilmImages } from '../../hooks/useFilmImages';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { FilmDetail, GalleryLightboxState, GallerySlide } from '../../types/film.types';
import { GALLERY_SLIDE_LIMIT } from '../../types/film.types';

import AmbientWash from './AmbientWash';
import ExtrasMetaColumn from './ExtrasMetaColumn';
import GalleryCardsSwiper from './GalleryCardsSwiper';
import GalleryLightbox from './GalleryLightbox';

export interface FilmExtrasSectionProps {
  filmSlug: string;
  filmTitle?: string;
  movie?: Partial<FilmDetail>;
}

export default function FilmExtrasSection({
  filmSlug,
  filmTitle = '',
  movie,
}: FilmExtrasSectionProps) {
  const { images, isLoading: isImagesLoading } = useFilmImages(filmSlug);
  const extras = useFilmExtras(filmSlug);
  const reduceMotion = usePrefersReducedMotion();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [lightbox, setLightbox] = useState<GalleryLightboxState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const posters = images.posters ?? [];
  const backdrops = images.backdrops ?? [];
  const hasImages = posters.length + backdrops.length > 0;

  const slides = useMemo<GallerySlide[]>(() => {
    if (posters.length > 0) {
      return posters.slice(0, GALLERY_SLIDE_LIMIT).map((url) => ({
        url,
        kind: 'poster' as const,
      }));
    }
    return backdrops.slice(0, GALLERY_SLIDE_LIMIT).map((url) => ({
      url,
      kind: 'backdrop' as const,
    }));
  }, [posters, backdrops]);

  const urls = useMemo(() => slides.map((s) => s.url), [slides]);
  const isPosterRail = slides[0]?.kind !== 'backdrop';
  const washUrl = slides[Math.min(activeIndex, Math.max(0, slides.length - 1))]?.url;

  const hasCast =
    extras.isPeoplesLoading ||
    extras.peoples.length > 0 ||
    Boolean(movie?.director?.length || movie?.actor?.length);
  const hasKeywords = extras.isKeywordsLoading || extras.keywords.length > 0;
  const hasAny = hasImages || isImagesLoading || hasCast || hasKeywords;

  useEffect(() => {
    setActiveIndex(0);
  }, [filmSlug, slides.length]);

  const openLightbox = useCallback(
    (index: number, trigger: HTMLElement | null) => {
      triggerRef.current = trigger;
      setLightbox({ list: urls, index });
    },
    [urls]
  );

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    requestAnimationFrame(() => trigger?.focus());
  }, []);

  if (!hasAny) return null;

  return (
    <section className="relative z-[2] py-[36px]">
      <AmbientWash washUrl={washUrl ?? null} />

      <div className="relative mx-auto px-[15px] 2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm">
        <div className="mb-[16px]">
          <p className="text-[10px] tracking-[0.3em] font-semibold text-primary/70 mb-[2px]">
            THÔNG TIN THÊM
          </p>
          <h2 className="text-[18px] md:text-[22px] font-semibold text-primary tracking-tight">
            Gallery · Cast · Từ khóa
          </h2>
        </div>

        <div className="relative flex flex-col md:flex-row md:items-stretch gap-[28px] md:gap-[36px]">
          <GalleryCardsSwiper
            filmSlug={filmSlug}
            filmTitle={filmTitle}
            slides={slides}
            isPosterRail={isPosterRail}
            isLoading={isImagesLoading}
            hasImages={hasImages}
            backdropCount={backdrops.length}
            posterCount={posters.length}
            reduceMotion={reduceMotion}
            onActiveIndexChange={setActiveIndex}
            onOpenLightbox={openLightbox}
          />

          <ExtrasMetaColumn
            {...(movie ? { movie } : {})}
            peoples={extras.peoples}
            profileSizes={extras.profileSizes}
            isPeoplesLoading={extras.isPeoplesLoading}
            keywords={extras.keywords}
            isKeywordsLoading={extras.isKeywordsLoading}
            hasCast={hasCast}
            hasKeywords={hasKeywords}
          />
        </div>
      </div>

      {lightbox ? (
        <GalleryLightbox
          images={lightbox.list}
          index={lightbox.index}
          onIndexChange={(i) => setLightbox((s) => (s ? { ...s, index: i } : s))}
          onClose={closeLightbox}
          reduceMotion={reduceMotion}
        />
      ) : null}
    </section>
  );
}
