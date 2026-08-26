import { z } from 'zod';

import type { SortFieldValue, SortTypeValue, SortLangValue } from '../constants/filter.constants';

/**
 * Zod schema để xác thực tham số bộ lọc danh mục được phân tích cú pháp từ URL.
 * Các giá trị không hợp lệ tự động chuyển về `undefined` (không áp dụng bộ lọc)
 * để ứng dụng không bị lỗi khi URL bị sai định dạng.
 */

const sortFieldSchema = z.enum(['modified.time', '_id', 'year']).optional().catch(undefined);

const sortTypeSchema = z.enum(['desc', 'asc']).optional().catch(undefined);

const sortLangSchema = z.enum(['vietsub', 'thuyet-minh', 'long-tieng']).optional().catch(undefined);

const currentYear = new Date().getFullYear();
const yearSchema = z.coerce.number().int().min(2000).max(currentYear).optional().catch(undefined);

export const catalogFilterSchema = z.object({
  sort_field: sortFieldSchema,
  sort_type: sortTypeSchema,
  sort_lang: sortLangSchema,
  year: yearSchema,
});

export type CatalogFilterParams = z.infer<typeof catalogFilterSchema>;

/**
 * Parse các tham số tìm kiếm URL thành giá trị bộ lọc.
 * Các khóa không hợp lệ hoặc không xác định sẽ bị loại bỏ.
 */
export function parseCatalogFilters(raw: Record<string, unknown>): CatalogFilterParams {
  return catalogFilterSchema.parse(raw);
}

/** Trả về các bộ lọc đang hoạt động (không bao gồm undefined). */
export function getActiveFilters(filters: CatalogFilterParams): Partial<CatalogFilterParams> {
  const active: Partial<CatalogFilterParams> = {};
  if (filters.sort_field) active.sort_field = filters.sort_field;
  if (filters.sort_type) active.sort_type = filters.sort_type;
  if (filters.sort_lang) active.sort_lang = filters.sort_lang;
  if (filters.year) active.year = filters.year;
  return active;
}

/** Đếm số bộ lọc đang hoạt động. */
export function countActiveFilters(filters: CatalogFilterParams): number {
  return Object.keys(getActiveFilters(filters)).length;
}

/** Xây dựng các tùy chọn truy vấn API từ các tham số bộ lọc, loại bỏ các khóa chưa được đặt. */
export function filtersToQueryOptions(
  filters: CatalogFilterParams
): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  if (filters.sort_field) result.sort_field = filters.sort_field;
  if (filters.sort_type) result.sort_type = filters.sort_type;
  if (filters.sort_lang) result.sort_lang = filters.sort_lang;
  if (filters.year !== undefined) result.year = filters.year;
  return result;
}

export type { SortFieldValue, SortTypeValue, SortLangValue };
