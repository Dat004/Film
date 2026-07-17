'use client';

import React from 'react';

import { FILM_UI_COPY } from '../constants/film-ui.constants';
import type { FilmDetail } from '../types/film.types';

const TYPE_LABELS: Record<string, string> = {
  single: 'Phim lẻ',
  series: 'Phim bộ',
  hoathinh: 'Hoạt hình',
  tvshows: 'TV Show',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Hoàn thành',
  ongoing: 'Đang chiếu',
};

export interface FilmMetaBadgesProps {
  movie?: Partial<FilmDetail>;
}

const FilmMetaBadges: React.FC<FilmMetaBadgesProps> = ({ movie }) => {
  const badges: string[] = [];

  if (movie?.quality) badges.push(movie.quality);
  if (movie?.lang) badges.push(movie.lang);
  if (movie?.type) badges.push(TYPE_LABELS[movie.type] || movie.type);
  if (movie?.status) badges.push(STATUS_LABELS[movie.status] || movie.status);
  if (movie?.chieurap) badges.push(FILM_UI_COPY.theatrical);

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-[6px]">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-[6px] border border-bd-filed-form-color bg-bg-field px-[8px] py-[3px] text-[11px] font-medium uppercase tracking-wide text-primary"
        >
          {badge}
        </span>
      ))}
    </div>
  );
};

export default FilmMetaBadges;
