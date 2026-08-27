'use client';

import React, { useMemo } from 'react';

import CatalogSkeleton from '@/components/ui/CatalogSkeleton';
import type { FetchRequest } from '@/hooks/useFetchData';

import { useCategoryFilm } from '../../hooks/useCategoryFilm';
import type { Film } from '../../types/film.types';
import BannerSkeleton from '../BannerSkeleton';
import { FilterBar } from '../FilterBar';
import SliderBanner from '../SliderBanner';
import VirtualFilmGrid from '../VirtualFilmGrid';

export interface CategoryFilmScreenProps {
  request: FetchRequest;
  params?: string;
  slug?: string;
}

const CategoryFilmScreenContent: React.FC<CategoryFilmScreenProps> = ({
  request,
  params = '',
  slug = '',
}) => {
  const {
    page,
    data,
    accumulatedItems,
    hasMore,
    dataBanner,
    isBannerLoading,
    isError,
    isFetching,
    isSuccess,
    handleLoadMore,
    filters,
    filterCount,
    setFilter,
    resetFilters,
  } = useCategoryFilm({ request, params: params || slug });

  type FilmListData = {
    items?: Partial<Film>[];
    APP_DOMAIN_CDN_IMAGE?: string;
    [key: string]: unknown;
  };
  const typedData = data as FilmListData | null;
  const typedBanner = dataBanner as {
    itemsBanner: Partial<Film>[] | null;
    APP_DOMAIN_CDN_IMAGE?: string;
  };

  const bannerSlugs = useMemo(
    () => new Set((typedBanner.itemsBanner ?? []).map((film) => film.slug).filter(Boolean)),
    [typedBanner.itemsBanner]
  );

  // Filter out items present in banner
  const gridItems = useMemo(() => {
    const list = accumulatedItems.length > 0 ? accumulatedItems : (typedData?.items ?? []);
    return list.filter((film) => !film?.slug || !bannerSlugs.has(film.slug));
  }, [accumulatedItems, typedData?.items, bannerSlugs]);

  const showBannerSkeleton = isBannerLoading || !typedBanner.itemsBanner?.length;

  const memolizedBanner = useMemo(() => {
    return showBannerSkeleton ? <BannerSkeleton /> : <SliderBanner data={typedBanner} />;
  }, [showBannerSkeleton, typedBanner]);

  return (
    <div className="mb-[40px]">
      <div className="mb-[40px]">{memolizedBanner}</div>
      <FilterBar
        filters={filters}
        activeCount={filterCount}
        onFilterChange={setFilter}
        onReset={resetFilters}
      />
      {(!isFetching || !isError || gridItems.length > 0) && isSuccess ? (
        <VirtualFilmGrid
          items={gridItems}
          baseUrl={typedData?.APP_DOMAIN_CDN_IMAGE}
          isLoadingMore={isFetching && page > 1}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      ) : (
        <div className="relative min-h-[calc(100dvh-90px)] mt-[40px] mask-loading">
          <CatalogSkeleton />
        </div>
      )}
    </div>
  );
};

export const CategoryFilmScreen: React.FC<CategoryFilmScreenProps> = (props) => {
  return (
    <React.Suspense
      fallback={
        <div className="mb-[40px]">
          <div className="mb-[40px]">
            <BannerSkeleton />
          </div>
          <div className="relative min-h-[calc(100dvh-90px)] mask-loading">
            <CatalogSkeleton />
          </div>
        </div>
      }
    >
      <CategoryFilmScreenContent {...props} />
    </React.Suspense>
  );
};

export default CategoryFilmScreen;
