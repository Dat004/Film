'use client';

import React from 'react';

import SkeletonContainer from './Skeleton';

/** Loading card for cinematic search results. */
function FilmCardSkeleton() {
  return (
    <section className="relative w-[100%] pb-[56.25%] rounded-[12px] overflow-hidden ring-1 ring-white/10">
      <div className="absolute inset-0">
        <SkeletonContainer duration={3} borderRadius={12} />
      </div>
      <div className="absolute left-[12px] bottom-[12px] w-[72px] sm:w-[88px] aspect-[2/3] rounded-[10px] overflow-hidden ring-1 ring-white/10">
        <SkeletonContainer duration={3} borderRadius={10} />
      </div>
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

const SearchPageSkeleton: React.FC = () => {
  return (
    <div className="flex items-start flex-wrap">
      <div className="2xlm:w-[100%] 2xlm:order-1 w-[calc(75%-10px)]">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="flex flex-wrap items-start mx-[-12px] mb-[30px] flex-grow-0 flex-shrink-0"
          >
            {Array.from({ length: 6 }, (_, innerIndex) => (
              <div
                key={innerIndex}
                className="w-[calc(100%/3)] mdm:w-[calc(100%/2)] ssm:w-[100%] flex-shrink-0 px-[12px] mb-[24px]"
              >
                <FilmCardSkeleton />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="2xlm:w-[100%] 2xlm:order-0 2xlm:mb-[40px] 2xlm:ml-[-12px] w-[calc(25%-10px)] ml-auto gap-y-[12px] flex-grow-0 flex-shrink-0 flex items-center flex-wrap mx-[-8px]">
        <div className="px-[8px] w-[100%] max-w-[120px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[320px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[180px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[145px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
        <div className="px-[8px] w-[100%] max-w-[220px] h-[25px]">
          <SkeletonContainer borderRadius={20} />
        </div>
      </div>
    </div>
  );
};

export default SearchPageSkeleton;
