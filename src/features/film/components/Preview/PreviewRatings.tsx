'use client';

import { Star } from 'lucide-react';

import type { FilmDetail } from '../../types/film.types';

export default function PreviewRatings({ movie }: { movie?: Partial<FilmDetail> }) {
  const tmdbAvg = movie?.tmdb?.vote_average;
  const imdbAvg = movie?.imdb?.vote_average;
  const hasTmdb = typeof tmdbAvg === 'number' && tmdbAvg > 0;
  const hasImdb = typeof imdbAvg === 'number' && imdbAvg > 0;

  if (!hasTmdb && !hasImdb) return null;

  return (
    <div className="flex flex-wrap items-center gap-[6px] mt-[8px]">
      {hasTmdb && (
        <span className="inline-flex items-center gap-[3px] rounded-[5px] bg-[rgba(234,179,8,0.15)] px-[6px] py-[2px] text-[12px] font-medium text-[#fbbf24]">
          <Star className="w-[10px] h-[10px] fill-current" />
          {tmdbAvg.toFixed(1)}
        </span>
      )}
      {hasImdb && (
        <span className="inline-flex items-center rounded-[5px] bg-fill-secondary px-[6px] py-[2px] text-[11px] font-medium text-primary">
          IMDB {imdbAvg.toFixed(1)}
        </span>
      )}
    </div>
  );
}
