'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useCallback, useMemo } from 'react';

import { FILTER_ALL_VALUE } from '../constants/filter.constants';
import {
  type CatalogFilterParams,
  parseCatalogFilters,
  countActiveFilters,
  filtersToQueryOptions,
} from '../lib/filter-schemas';

/**
 * Quản lý trạng thái bộ lọc danh mục được đồng bộ hóa với URL thông qua nuqs.
 * Mỗi bộ lọc là một tham số tìm kiếm độc lập — có thể chia sẻ, an toàn với điều hướng quay lại/tiến tới.
 * Các giá trị URL không hợp lệ được tự động reset về undefined thông qua `.catch()` của Zod.
 */
export function useCatalogFilters() {
  // Trạng thái URL cho mỗi bộ lọc
  const [sortField, setSortField] = useQueryState(
    'sort_field',
    parseAsString.withDefault('').withOptions({ shallow: false })
  );
  const [sortType, setSortType] = useQueryState(
    'sort_type',
    parseAsString.withDefault('').withOptions({ shallow: false })
  );
  const [sortLang, setSortLang] = useQueryState(
    'sort_lang',
    parseAsString.withDefault('').withOptions({ shallow: false })
  );
  const [yearRaw, setYearRaw] = useQueryState(
    'year',
    parseAsInteger.withDefault(0).withOptions({ shallow: false })
  );

  // Parse + validate thông qua Zod
  const filters = useMemo<CatalogFilterParams>(() => {
    return parseCatalogFilters({
      sort_field: sortField || undefined,
      sort_type: sortType || undefined,
      sort_lang: sortLang || undefined,
      year: yearRaw || undefined,
    });
  }, [sortField, sortType, sortLang, yearRaw]);

  // Đếm số bộ lọc đang hoạt động
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  // Các giá trị bộ lọc hợp lệ sẵn sàng để spread vào API options.
  const queryOptions = useMemo(() => filtersToQueryOptions(filters), [filters]);

  // Các phương thức set individual
  const setFilter = useCallback(
    (key: keyof CatalogFilterParams, value: string | number | undefined) => {
      const cleared = value === FILTER_ALL_VALUE || value === '' || value === 0;
      switch (key) {
        case 'sort_field':
          setSortField(cleared ? '' : String(value));
          break;
        case 'sort_type':
          setSortType(cleared ? '' : String(value));
          break;
        case 'sort_lang':
          setSortLang(cleared ? '' : String(value));
          break;
        case 'year':
          setYearRaw(cleared ? 0 : Number(value));
          break;
      }
    },
    [setSortField, setSortType, setSortLang, setYearRaw]
  );

  // Reset tất cả bộ lọc
  const resetFilters = useCallback(() => {
    setSortField('');
    setSortType('');
    setSortLang('');
    setYearRaw(0);
  }, [setSortField, setSortType, setSortLang, setYearRaw]);

  return {
    filters,
    queryOptions,
    activeCount,
    setFilter,
    resetFilters,
  } as const;
}

export default useCatalogFilters;
