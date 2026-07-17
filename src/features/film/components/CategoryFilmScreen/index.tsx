'use client';

import React, { useMemo } from 'react';

import CatalogSkeleton from '@/components/ui/CatalogSkeleton';
import CustomPagination from '@/components/ui/CustomPagination';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import type { FetchRequest } from '@/hooks/useFetchData';

import { useCategoryFilm } from '../../hooks/useCategoryFilm';
import type { Film } from '../../types/film.types';
import BannerSkeleton from '../BannerSkeleton';
import FilmElement from '../FilmElement';
import SliderBanner from '../SliderBanner';

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
    endPage,
    dataBanner,
    isBannerLoading,
    isError,
    isFetching,
    isSuccess,
    handleChangePage,
    handleNextPage,
    handlePrevPage,
  } = useCategoryFilm({ request, params: params || slug });

  type FilmListData = {
    items?: Partial<Film>[];
    APP_DOMAIN_CDN_IMAGE?: string;
    [key: string]: unknown;
  };
  type PaginationData = { totalPages: number };
  const typedData = data as FilmListData | null;
  const typedEndPage = endPage as PaginationData | null;
  const typedBanner = dataBanner as {
    itemsBanner: Partial<Film>[] | null;
    APP_DOMAIN_CDN_IMAGE?: string;
  };

  const bannerSlugs = useMemo(
    () => new Set((typedBanner.itemsBanner ?? []).map((film) => film.slug).filter(Boolean)),
    [typedBanner.itemsBanner]
  );

  const gridItems = useMemo(
    () => typedData?.items?.filter((film) => !film?.slug || !bannerSlugs.has(film.slug)) ?? [],
    [typedData?.items, bannerSlugs]
  );

  const showBannerSkeleton = isBannerLoading || !typedBanner.itemsBanner?.length;

  const memolizedBanner = useMemo(() => {
    return showBannerSkeleton ? <BannerSkeleton /> : <SliderBanner data={typedBanner} />;
  }, [showBannerSkeleton, typedBanner]);

  const memolizedPagination = useMemo(() => {
    return (
      <>
        {!typedEndPage ? null : (
          <CustomPagination
            activeIndex={page}
            countsPrev={3}
            countsNext={3}
            startIndex={1}
            endIndex={typedEndPage.totalPages}
            onIndex={handleChangePage}
            onNextIndex={handleNextPage}
            onPrevIndex={handlePrevPage}
          />
        )}
      </>
    );
  }, [typedEndPage, page, handleChangePage, handleNextPage, handlePrevPage]);

  return (
    <div className="mb-[40px]">
      <div className="mb-[40px]">{memolizedBanner}</div>
      {(!isFetching || !isError) && isSuccess ? (
        <>
          <FlexContainer className="mx-[-12px] pb-[24px] items-start" isWrap>
            {gridItems.map((items) => (
              <FlexItems
                // Breakpoints project: *m = max-width. Desktop-first: 3 → 2 → 1
                className="w-[calc(100%/3)] mdm:w-[calc(100%/2)] ssm:w-[100%] px-[12px]"
                key={items?._id}
              >
                <FilmElement data={items} baseUrl={typedData?.APP_DOMAIN_CDN_IMAGE} />
              </FlexItems>
            ))}
          </FlexContainer>
        </>
      ) : (
        <div className="relative min-h-[calc(100dvh-90px)] mt-[40px] mask-loading">
          <CatalogSkeleton />
        </div>
      )}
      <>{memolizedPagination}</>
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
