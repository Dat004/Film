import { useQueryState, parseAsInteger } from 'nuqs';
import { useState, useEffect, useMemo } from 'react';

import { useFetchData } from '@/hooks';
import type { FetchRequest } from '@/hooks/useFetchData';

import {
  buildBannerDataPayload,
  resolveBannerDanhSachQuery,
  type BannerDanhSachQuery,
  type BannerDataPayload,
} from '../lib/banner-films';
import { danhSachService, danhSachV1Service } from '../services/film.service';

export interface UseCategoryFilmProps {
  request: FetchRequest;
  params?: string;
  bannerQuery?: BannerDanhSachQuery;
}

function normalizePagination(
  pagination: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!pagination) return null;
  if (typeof pagination.totalPages === 'number' && pagination.totalPages > 0) {
    return pagination;
  }
  const totalItems = Number(pagination.totalItems) || 0;
  const perPage = Number(pagination.totalItemsPerPage) || 1;
  return {
    ...pagination,
    totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
  };
}

export function useCategoryFilm({ request, params, bannerQuery }: UseCategoryFilmProps) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const [limit] = useQueryState(
    'limit',
    parseAsInteger.withDefault(20).withOptions({ shallow: false })
  );

  const [endPage, setEndPage] = useState<Record<string, unknown> | null>(null);

  const resolvedBannerQuery = useMemo(
    () => bannerQuery ?? resolveBannerDanhSachQuery(request.name, params),
    [bannerQuery, request.name, params]
  );

  const { newData, state } = useFetchData({
    request,
    options: {
      slug: params,
      page,
      limit,
    },
    dependencies: [page, limit, params],
  });
  const { isError, isFetching, isSuccess } = state;

  const isNewFilmList = request.name === 'newFilmService';
  // Page 1: banner lấy từ chính list catalog đang hiển thị (Home/Phim mới, phim-bo, …).
  const reuseGridForBanner = page === 1;

  const { newData: bannerRaw, state: bannerState } = useFetchData({
    request: isNewFilmList ? danhSachService : danhSachV1Service,
    path: isNewFilmList ? undefined : resolvedBannerQuery.type,
    options: {
      page: 1,
      limit: 24,
      category: resolvedBannerQuery.category,
      country: resolvedBannerQuery.country,
      sort_field: 'modified.time',
      sort_type: 'desc',
    },
    dependencies: [
      resolvedBannerQuery.type,
      resolvedBannerQuery.category,
      resolvedBannerQuery.country,
      params,
      isNewFilmList,
    ],
    condition: !reuseGridForBanner,
  });

  const dataBanner = useMemo<BannerDataPayload>(() => {
    if (reuseGridForBanner && newData) {
      return buildBannerDataPayload(newData as Record<string, unknown>);
    }
    if (!bannerRaw) {
      return { itemsBanner: null };
    }
    return buildBannerDataPayload(bannerRaw as Record<string, unknown>);
  }, [reuseGridForBanner, newData, bannerRaw]);

  // Show the banner skeleton until the first items arrive.
  const isBannerLoading =
    !dataBanner.itemsBanner?.length &&
    (reuseGridForBanner ? isFetching || !newData : bannerState.isFetching || !bannerRaw);

  useEffect(() => {
    if (params) {
      setEndPage(null);
      setPage(1);
    }
  }, [params, setPage]);

  useEffect(() => {
    if (newData) {
      const nd = newData as Record<string, unknown>;
      if (!endPage) {
        const apiParams = nd['params'] as Record<string, unknown> | undefined;
        setEndPage(normalizePagination(apiParams?.['pagination'] as Record<string, unknown>));
      }
    }
  }, [newData, endPage]);

  const handleChangePage = (index: number) => {
    setPage(index);
  };

  const handleNextPage = () => {
    const totalPages = (endPage?.['totalPages'] as number) ?? 0;
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return {
    page,
    limit,
    data: newData as Record<string, unknown> | null,
    endPage,
    dataBanner,
    isBannerLoading,
    isError,
    isFetching,
    isSuccess,
    handleChangePage,
    handleNextPage,
    handlePrevPage,
  };
}

export default useCategoryFilm;
