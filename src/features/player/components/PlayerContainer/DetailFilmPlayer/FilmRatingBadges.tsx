'use client';

import { Star } from 'lucide-react';
import React from 'react';

import type { FilmDetail } from '@/features/film/types/film.types';

export interface FilmRatingBadgesProps {
  movie?: Partial<FilmDetail>;
}

const FilmRatingBadges: React.FC<FilmRatingBadgesProps> = ({ movie }) => {
  const tmdbAvg = movie?.tmdb?.vote_average;
  const tmdbCount = movie?.tmdb?.vote_count;
  const imdbAvg = movie?.imdb?.vote_average;

  const hasTmdb = typeof tmdbAvg === 'number' && tmdbAvg > 0;
  const hasImdb = typeof imdbAvg === 'number' && imdbAvg > 0;

  if (!hasTmdb && !hasImdb && !movie?.year && !movie?.time) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-[10px] gap-y-[6px] detail769:justify-start">
      {hasTmdb && (
        <span className="inline-flex items-center gap-[4px] rounded-[6px] bg-[rgba(234,179,8,0.15)] px-[8px] py-[3px] text-[12px] font-medium text-[#fbbf24]">
          <Star className="w-[12px] h-[12px] fill-current" />
          TMDB {tmdbAvg.toFixed(1)}
          {tmdbCount ? <span className="opacity-70">({tmdbCount})</span> : null}
        </span>
      )}
      {hasImdb && (
        <span className="inline-flex items-center gap-[4px] rounded-[6px] bg-fill-secondary px-[8px] py-[3px] text-[12px] font-medium text-primary">
          IMDB {imdbAvg.toFixed(1)}
        </span>
      )}
      {movie?.year ? (
        <span className="text-[13px] font-medium text-primary/90">{movie.year}</span>
      ) : null}
      {movie?.time ? (
        <>
          <span className="text-primary/40">·</span>
          <span className="text-[13px] font-medium text-primary/90">{movie.time}</span>
        </>
      ) : null}
    </div>
  );
};

export default FilmRatingBadges;
