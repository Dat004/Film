'use client';

import React from 'react';

import SkeletonContainer from '@/components/ui/Skeleton';

/** Loading layout matching the banner media and information columns. */
const BannerSkeleton: React.FC = () => {
  return (
    <div className="relative flex min-h-[360px] w-full flex-row overflow-hidden rounded-[12px] ring-1 ring-white/10 bg-bg-block mdm:min-h-0 mdm:flex-col">
      {/* Media — 58% */}
      <div className="relative w-[58%] shrink-0 mdm:w-full">
        <div className="relative min-h-[360px] mdm:min-h-0 mdm:pb-[56.25%]">
          <div className="absolute inset-0 overflow-hidden">
            <SkeletonContainer duration={3} borderRadius={0} />
          </div>
          <div className="absolute bottom-[14px] right-[16px] z-10 flex items-center gap-[6px]">
            <div className="h-[6px] w-[28px]">
              <SkeletonContainer duration={3} borderRadius={999} />
            </div>
            <div className="h-[6px] w-[14px]">
              <SkeletonContainer duration={3} borderRadius={999} />
            </div>
            <div className="h-[6px] w-[14px]">
              <SkeletonContainer duration={3} borderRadius={999} />
            </div>
          </div>
        </div>
      </div>

      {/* Info — 42% */}
      <div className="flex min-h-[360px] w-[42%] flex-col justify-center gap-[10px] px-[24px] py-[28px] mdm:min-h-0 mdm:w-full mdm:px-[18px] mdm:py-[20px] lg:px-[32px]">
        <div className="h-[28px] max-w-[90%]">
          <SkeletonContainer duration={3} borderRadius={6} />
        </div>
        <div className="h-[28px] max-w-[58%]">
          <SkeletonContainer duration={3} borderRadius={6} />
        </div>
        <div className="h-[14px] max-w-[42%]">
          <SkeletonContainer duration={3} borderRadius={6} />
        </div>
        <div className="mt-[6px] h-[14px] max-w-full">
          <SkeletonContainer duration={3} borderRadius={6} />
        </div>
        <div className="h-[14px] max-w-[75%]">
          <SkeletonContainer duration={3} borderRadius={6} />
        </div>
        <div className="mt-[10px] h-[44px] w-[140px]">
          <SkeletonContainer duration={3} borderRadius={8} />
        </div>
      </div>
    </div>
  );
};

export default BannerSkeleton;
