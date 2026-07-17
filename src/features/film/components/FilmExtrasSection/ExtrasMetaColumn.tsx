'use client';

import type { FilmDetail, FilmKeyword, FilmPerson } from '../../types/film.types';
import CastGrid from '../CastGrid';
import KeywordChips from '../KeywordChips';

export interface ExtrasMetaColumnProps {
  movie?: Partial<FilmDetail>;
  peoples: FilmPerson[];
  profileSizes: Record<string, string>;
  isPeoplesLoading: boolean;
  keywords: FilmKeyword[];
  isKeywordsLoading: boolean;
  hasCast: boolean;
  hasKeywords: boolean;
}

export default function ExtrasMetaColumn({
  movie,
  peoples,
  profileSizes,
  isPeoplesLoading,
  keywords,
  isKeywordsLoading,
  hasCast,
  hasKeywords,
}: ExtrasMetaColumnProps) {
  return (
    <div className="relative z-[1] flex min-w-0 flex-1 flex-col justify-center gap-[28px] md:border-l md:border-bd-filed-form-color md:px-[32px]">
      {hasCast ? (
        <CastGrid
          peoples={peoples}
          {...(movie ? { movie } : {})}
          profileSizes={profileSizes}
          isLoading={isPeoplesLoading}
          embedded
        />
      ) : null}

      {hasKeywords ? (
        <KeywordChips keywords={keywords} isLoading={isKeywordsLoading} embedded />
      ) : null}

      {!hasCast && !hasKeywords ? (
        <p className="text-[12px] text-secondary">Chưa có thông tin cast / từ khóa.</p>
      ) : null}
    </div>
  );
}
