'use client';

import React from 'react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import type { FilmDetail, FilmPerson } from '@/features/film/types/film.types';
import { buildPersonProfileUrl } from '@/lib/film-detail-extras';

export interface CastGridProps {
  peoples?: FilmPerson[];
  movie?: Partial<FilmDetail>;
  profileSizes?: Record<string, string>;
  isLoading?: boolean;
  /** Removes the outer frame when rendered inside a shared panel. */
  embedded?: boolean;
}

function PersonCard({
  name,
  subtitle,
  photoUrl,
}: {
  name: string;
  subtitle?: string | undefined;
  photoUrl?: string | null | undefined;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center gap-[6px]">
      <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-full border-2 border-bd-filed-form-color bg-bg-sidebar box-border">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-field text-[20px] font-semibold text-primary/80">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <p className="w-full text-center text-[12px] font-semibold leading-tight text-primary line-clamp-2">
        {name}
      </p>
      {subtitle ? (
        <p className="w-full text-center text-[11px] font-medium text-primary/70 line-clamp-1">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

const CastGrid: React.FC<CastGridProps> = ({
  peoples = [],
  movie,
  profileSizes,
  isLoading = false,
  embedded = false,
}) => {
  const hasPeoples = peoples.length > 0;

  const fallbackPeople: FilmPerson[] = [];
  if (!hasPeoples && movie) {
    (movie.director || []).forEach((name) => {
      fallbackPeople.push({ name, job: 'Đạo diễn' });
    });
    (movie.actor || []).slice(0, 12).forEach((name) => {
      fallbackPeople.push({ name, character: 'Diễn viên' });
    });
  }

  const displayList = hasPeoples ? peoples.slice(0, 16) : fallbackPeople.slice(0, 16);

  const shellClass = embedded
    ? 'min-w-0 w-full'
    : 'mt-[20px] rounded-[10px] border border-bd-filed-form-color bg-bg-sidebar/60 p-[16px]';

  if (isLoading) {
    return (
      <div className={shellClass}>
        <h3 className="mb-[14px] text-[14px] font-semibold text-primary">Đạo diễn & diễn viên</h3>
        <div className="flex gap-[16px] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[84px] shrink-0 animate-pulse">
              <div className="mx-auto h-[64px] w-[64px] rounded-full bg-fill-secondary" />
              <div className="mt-[8px] h-[10px] rounded bg-fill-secondary" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayList.length === 0) return null;

  return (
    <div className={shellClass}>
      <h3 className="mb-[14px] text-[14px] font-semibold text-primary">Đạo diễn & diễn viên</h3>
      <div className="min-w-0 w-full overflow-hidden">
        <Swiper
          modules={[FreeMode, Mousewheel]}
          freeMode={{
            enabled: true,
            sticky: false,
            momentum: true,
            momentumRatio: 0.35,
            momentumVelocityRatio: 0.35,
          }}
          slidesPerView="auto"
          spaceBetween={16}
          grabCursor
          resistanceRatio={0.85}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 0.8,
          }}
          className="cast-swiper w-full !overflow-hidden"
        >
          {displayList.map((person, index) => {
            const name = person.name || 'Không rõ';
            const subtitle = person.character || person.job || person.department;
            const photoUrl = buildPersonProfileUrl(person, profileSizes);
            return (
              <SwiperSlide
                key={`${name}-${index}`}
                style={{ width: 84 }}
                className="!h-auto !box-border"
              >
                <PersonCard
                  name={name}
                  {...(subtitle ? { subtitle } : {})}
                  {...(photoUrl ? { photoUrl } : {})}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default CastGrid;
