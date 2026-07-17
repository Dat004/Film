import React, { Suspense } from 'react';

import { SliderFilm } from '@/features/film';
import { FILM_UI_COPY } from '@/features/film/constants/film-ui.constants';
import { RELATED_SLIDER_FILM_BREAKPOINTS } from '@/features/film/constants/slider.constants';
import { fetchRelatedFilms } from '@/features/film/services/related-films.service';

export interface RelatedFilmsSectionProps {
  filmSlug: string;
  categorySlugs?: string[] | undefined;
  currentSlug: string;
}

function RelatedFilmsSkeleton() {
  return (
    <section className="relative z-[1] px-[15px] py-[50px] mx-auto 2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm">
      <div className="mb-[16px] h-[28px] w-[180px] rounded-[6px] bg-fill-secondary animate-pulse" />
      <div className="flex gap-[12px] overflow-hidden">
        <div className="w-[82%] shrink-0 sm:hidden">
          <div className="relative w-full pb-[56.25%] rounded-[12px] overflow-hidden bg-fill-secondary animate-pulse" />
        </div>
        <div className="w-[82%] shrink-0 sm:hidden" aria-hidden>
          <div className="relative w-full pb-[56.25%] rounded-[12px] overflow-hidden bg-fill-secondary animate-pulse" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`related-skel-${i}`}
            className="hidden min-w-0 flex-1 sm:block relative pb-[56.25%] rounded-[12px] overflow-hidden bg-fill-secondary animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

async function RelatedFilmsContent({
  filmSlug,
  categorySlugs = [],
  currentSlug,
}: RelatedFilmsSectionProps) {
  const related = await fetchRelatedFilms(filmSlug, currentSlug, categorySlugs);

  if (!related || related.items.length === 0) return null;

  return (
    <section className="relative z-[1] py-[50px] clm:px-[15px] player3col:px-[15px] mx-auto">
      <SliderFilm
        value={{
          items: related.items,
          data: {
            titlePage: FILM_UI_COPY.relatedFilms,
            type_list: related.moreLink,
            APP_DOMAIN_CDN_IMAGE: related.cdnBase,
          },
        }}
        breakpoints={RELATED_SLIDER_FILM_BREAKPOINTS}
        title={FILM_UI_COPY.relatedFilms}
        to={related.moreLink}
      />
    </section>
  );
}

/** Loads related films without blocking the player or film details. */
export default function RelatedFilmsSection(props: RelatedFilmsSectionProps) {
  return (
    <Suspense fallback={<RelatedFilmsSkeleton />}>
      <RelatedFilmsContent {...props} />
    </Suspense>
  );
}
