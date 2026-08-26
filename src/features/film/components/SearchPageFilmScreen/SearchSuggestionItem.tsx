'use client';

import { Film as FilmIcon, Play } from 'lucide-react';
import React from 'react';

import { resolveFilmImageUrl } from '@/lib/film-detail';
import { cn } from '@/lib/utils';

import { highlightText } from '../../lib/highlight-text';
import type { Film } from '../../types/film.types';

export interface SearchSuggestionItemProps {
  film: Film;
  keyword: string;
  isSelected?: boolean;
  onSelect: (film: Film) => void;
  id?: string;
}

export function SearchSuggestionItem({
  film,
  keyword,
  isSelected = false,
  onSelect,
  id,
}: SearchSuggestionItemProps) {
  const imageUrl = resolveFilmImageUrl(film.poster_url || film.thumb_url);

  return (
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(film)}
      className={cn(
        'group relative flex flex-col p-1.5 rounded-[6px] transition-all cursor-pointer select-none',
        isSelected ? 'bg-bg-select-color' : 'hover:bg-bg-odd-color'
      )}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[6px] bg-bg-odd-color mb-2">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={film.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-title/40">
            <FilmIcon className="size-6" />
          </div>
        )}

        {/* Quality Badge */}
        {film.quality ? (
          <span className="absolute top-1.5 left-1.5 rounded-[3px] bg-black/80 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-[var(--hover-color)] shadow-sm">
            {film.quality}
          </span>
        ) : null}

        {/* Year Badge */}
        {film.year ? (
          <span className="absolute top-1.5 right-1.5 rounded-[3px] bg-black/80 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-white/90 shadow-sm">
            {film.year}
          </span>
        ) : null}

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="rounded-full bg-[var(--hover-color)] p-2 text-white shadow-md transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="size-4 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0 px-0.5">
        <div className="text-[12.5px] font-medium text-primary group-hover:text-[var(--hover-color)] transition-colors line-clamp-1 leading-snug">
          {highlightText(film.name, keyword)}
        </div>
        {film.origin_name ? (
          <div className="text-[11px] text-title line-clamp-1 mt-0.5">
            {highlightText(film.origin_name, keyword)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchSuggestionItem;
