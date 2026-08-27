import { useQueryState, parseAsInteger } from 'nuqs';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import { useFetchData } from '@/hooks';
import type { FetchRequest } from '@/hooks/useFetchData';

import {
  buildBannerDataPayload,
  resolveBannerDanhSachQuery,
  type BannerDanhSachQuery,
  type BannerDataPayload,
} from '../lib/banner-films';
import { danhSachService, danhSachV1Service } from '../services/film.service';
import type { Film } from '../types/film.types';

import { useCatalogFilters } from './useCatalogFilters';

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
  const [accumulatedItems, setAccumulatedItems] = useState<Partial<Film>[]>([]);

  // Catalog filters (synced to URL)
  const {
    filters,
    queryOptions: filterQueryOptions,
    activeCount: filterCount,
    setFilter,
    resetFilters,
  } = useCatalogFilters();

  // Reset page & accumulated items whenever filter params change.
  const prevFilterKeyRef = useRef(JSON.stringify(filterQueryOptions));
  useEffect(() => {
    const key = JSON.stringify(filterQueryOptions);
    if (prevFilterKeyRef.current !== key) {
      prevFilterKeyRef.current = key;
      setEndPage(null);
      setAccumulatedItems([]);
      setPage(1);
    }
  }, [filterQueryOptions, setPage]);

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
      ...filterQueryOptions,
    },
    dependencies: [page, limit, params, filterQueryOptions],
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
      setAccumulatedItems([]);
      setPage(1);
    }
  }, [params, setPage]);

  // Accumulate items for virtualized infinite scroll grid
  useEffect(() => {
    if (newData) {
      const nd = newData as Record<string, unknown>;
      const items = (nd['items'] as Partial<Film>[]) || [];

      if (!endPage) {
        const apiParams = nd['params'] as Record<string, unknown> | undefined;
        setEndPage(normalizePagination(apiParams?.['pagination'] as Record<string, unknown>));
      }

      setAccumulatedItems((prev) => {
        if (page === 1) return items;
        // Avoid duplicate items by slug/_id
        const existingSlugs = new Set(prev.map((f) => f.slug || f._id));
        const newItems = items.filter((f) => !existingSlugs.has(f.slug || f._id));
        return [...prev, ...newItems];
      });
    }
  }, [newData, endPage, page]);

  const totalPages = (endPage?.['totalPages'] as number) ?? 0;
  const hasMore = page < totalPages;

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isFetching, setPage]);

  const handleChangePage = (index: number) => {
    setAccumulatedItems([]);
    setPage(index);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setAccumulatedItems([]);
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setAccumulatedItems([]);
      setPage(page - 1);
    }
  };

  return {
    page,
    limit,
    data: newData as Record<string, unknown> | null,
    accumulatedItems,
    endPage,
    hasMore,
    dataBanner,
    isBannerLoading,
    isError,
    isFetching,
    isSuccess,
    handleLoadMore,
    handleChangePage,
    handleNextPage,
    handlePrevPage,
    // Filter support
    filters,
    filterCount,
    setFilter,
    resetFilters,
  };
}

export default useCategoryFilm;
