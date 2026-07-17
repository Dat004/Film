'use client';

import React from 'react';

import SkeletonContainer from './Skeleton';

export interface CatalogSkeletonProps {
  count?: number;
}

/** Loading card for the cinematic film layout. */
function FilmCardSkeleton() {
  return (
    <section className="relative w-[100%] pb-[56.25%] rounded-[12px] overflow-hidden ring-1 ring-white/10">
      <div className="absolute inset-0">
        <SkeletonContainer duration={3} borderRadius={12} />
      </div>
      {/* Sticker poster */}
      <div className="absolute left-[12px] bottom-[12px] w-[72px] sm:w-[88px] aspect-[2/3] rounded-[10px] overflow-hidden ring-1 ring-white/10">
        <SkeletonContainer duration={3} borderRadius={10} />
      </div>
      {/* Title lines beside the poster sticker. */}
      <div className="absolute left-[96px] sm:left-[112px] right-[12px] bottom-[18px]">
        <SkeletonContainer className="!h-[14px] max-w-[85%]" duration={3} borderRadius={4} />
        <SkeletonContainer
          className="!h-[12px] max-w-[40%] mt-[8px]"
          duration={3}
          borderRadius={4}
        />
      </div>
    </section>
  );
}

/** Matches the responsive home-slider breakpoints. */
function SliderRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {/* &lt;640: ~1.15–1.25 + peek */}
      <div className="w-[82%] max-w-[82%] shrink-0 sm:hidden">
        <FilmCardSkeleton />
      </div>
      <div className="w-[82%] max-w-[82%] shrink-0 sm:hidden" aria-hidden>
        <FilmCardSkeleton />
      </div>

      {/* 640–1023: ~2.1 */}
      <div className="hidden min-w-0 w-[calc((100%-12px)/2.1)] shrink-0 sm:block lg:hidden">
        <FilmCardSkeleton />
      </div>
      <div className="hidden min-w-0 w-[calc((100%-12px)/2.1)] shrink-0 sm:block lg:hidden">
        <FilmCardSkeleton />
      </div>
      <div
        className="hidden min-w-0 w-[calc((100%-12px)/2.1)] shrink-0 sm:block lg:hidden"
        aria-hidden
      >
        <FilmCardSkeleton />
      </div>

      {/* ≥1024: ~2.6–3 */}
      <div className="hidden min-w-0 w-[calc((100%-24px)/3)] shrink-0 lg:block">
        <FilmCardSkeleton />
      </div>
      <div className="hidden min-w-0 w-[calc((100%-24px)/3)] shrink-0 lg:block">
        <FilmCardSkeleton />
      </div>
      <div className="hidden min-w-0 w-[calc((100%-24px)/3)] shrink-0 lg:block">
        <FilmCardSkeleton />
      </div>
    </div>
  );
}

const CatalogSkeleton: React.FC<CatalogSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="mb-[40px]">
          <div className="flex items-center mb-[24px]">
            <div className="w-[50%] flex-shrink-0 max-w-[35%]">
              <SkeletonContainer className="!h-[30px]" duration={3} borderRadius={4} />
            </div>
            <div className="ml-auto w-[50%] flex-shrink-0 max-w-[90px]">
              <SkeletonContainer className="!h-[30px]" duration={3} borderRadius={4} />
            </div>
          </div>
          <SliderRowSkeleton />
        </div>
      ))}
    </>
  );
};

export default CatalogSkeleton;
