'use client';

import React from 'react';

import type { FilmKeyword } from '@/features/film/types/film.types';

export interface KeywordChipsProps {
  keywords?: FilmKeyword[];
  isLoading?: boolean;
  /** Removes outer spacing when rendered inside a shared panel. */
  embedded?: boolean;
}

const KeywordChips: React.FC<KeywordChipsProps> = ({
  keywords = [],
  isLoading = false,
  embedded = false,
}) => {
  const wrapClass = embedded ? 'min-w-0' : 'mt-[16px]';

  if (isLoading) {
    return (
      <div className={wrapClass}>
        <h3 className="text-[14px] font-semibold text-primary mb-[12px]">Từ khóa</h3>
        <div className="flex flex-wrap gap-[8px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={`kw-skel-${i}`}
              className="h-[28px] w-[80px] rounded-full bg-fill-secondary animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (keywords.length === 0) return null;

  return (
    <div className={wrapClass}>
      <h3 className="text-[14px] font-semibold text-primary mb-[12px]">Từ khóa</h3>
      <div className="flex flex-wrap gap-[8px]">
        {keywords.map((kw, index) => (
          <span
            key={`kw-${kw.id ?? 'x'}-${kw.name ?? 'unnamed'}-${index}`}
            className="rounded-full border border-bd-filed-form-color bg-bg-block px-[12px] py-[6px] text-[12px] font-medium text-primary/80"
          >
            {kw.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default KeywordChips;
