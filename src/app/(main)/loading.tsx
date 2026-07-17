import React from 'react';

import CatalogSkeleton from '@/components/ui/CatalogSkeleton';
import BannerSkeleton from '@/features/film/components/BannerSkeleton';

export default function Loading() {
  return (
    <div className="mb-[40px]">
      <div className="mb-[40px]">
        <BannerSkeleton />
      </div>
      <div className="relative min-h-[calc(100dvh-90px)] mask-loading">
        <CatalogSkeleton />
      </div>
    </div>
  );
}
