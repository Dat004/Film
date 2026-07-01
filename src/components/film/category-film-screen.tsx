"use client";

import * as React from "react";
import { FilmListResponse } from "@/features/film/services/film-service";
import CatalogSkeleton from "@/components/Skeleton/CatalogSkeleton";
import Pagination from "@/components/ui/pagination";
import SkeletonContainer from "@/components/Skeleton";
import { FilmBannerSlider } from "@/components/film/film-banner-slider";
import { FilmElement } from "@/components/Element";

interface CategoryFilmScreenProps {
  title: string;
  data: FilmListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function CategoryFilmScreen({
  title,
  data,
  isLoading,
  isError,
  page,
  onPageChange,
}: CategoryFilmScreenProps) {
  const pagination = data?.data?.params?.pagination;
  const items = data?.data?.items || [];
  const cdnImage = data?.data?.APP_DOMAIN_CDN_IMAGE || "";

  // Prepare banner data
  const dataBanner = React.useMemo(() => {
    if (!items.length) return { itemsBanner: null };
    return {
      itemsBanner: items.slice(0, 10),
      ...data?.data,
    };
  }, [items, data]);

  const bannerSection = React.useMemo(() => {
    if (!dataBanner.itemsBanner) {
      return (
        <div className="flex justify-center">
          <div className="relative w-full max-w-[1200px] pb-[56.25%]">
            <section className="absolute inset-0">
              <SkeletonContainer borderRadius={4} />
            </section>
          </div>
        </div>
      );
    }
    return <FilmBannerSlider data={dataBanner} />;
  }, [dataBanner]);

  const paginationSection = React.useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
      <Pagination
        activeIndex={page}
        countsPrev={3}
        countsNext={3}
        startIndex={1}
        endIndex={pagination.totalPages}
        onIndex={onPageChange}
        onNextIndex={() => onPageChange(Math.min(page + 1, pagination.totalPages))}
        onPrevIndex={() => onPageChange(Math.max(page - 1, 1))}
      />
    );
  }, [pagination, page, onPageChange]);

  return (
    <div className="mb-[40px]">
      <div className="mb-[40px]">{bannerSection}</div>
      {isLoading ? (
        <div className="relative min-h-[calc(100dvh-90px)] mt-[40px] mask-loading">
          <CatalogSkeleton />
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-10">
          Có lỗi xảy ra khi tải danh sách phim. Vui lòng thử lại sau!
        </div>
      ) : (
        <>
          <div className="px-4 mb-4">
            <h2 className="text-primary text-[24px] font-semibold">{title}</h2>
          </div>
          <div className="flex flex-wrap gap-y-[40px] mx-[-12px] pb-[24px] items-start">
            {items.map((item) => (
              <div
                className="relative flex-grow flex-shrink-0 w-[calc(100%/5)] xsm:w-full ssm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] px-[12px]"
                key={item._id}
              >
                <FilmElement data={item} baseUrl={cdnImage} />
              </div>
            ))}
          </div>
        </>
      )}
      {paginationSection}
    </div>
  );
}
export default CategoryFilmScreen;
