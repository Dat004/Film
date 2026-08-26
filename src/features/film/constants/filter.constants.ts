/** Lựa chọn bộ lọc phim (DanhSachV1QueryOptions). */

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

// Sắp xếp theo
export type SortFieldValue = 'modified.time' | '_id' | 'year';

export const SORT_FIELD_OPTIONS: FilterOption<SortFieldValue>[] = [
  { value: 'modified.time', label: 'Mới cập nhật' },
  { value: '_id', label: 'Mới thêm' },
  { value: 'year', label: 'Năm sản xuất' },
];

// ── Thứ tự sắp xếp
export type SortTypeValue = 'desc' | 'asc';

export const SORT_TYPE_OPTIONS: FilterOption<SortTypeValue>[] = [
  { value: 'desc', label: 'Giảm dần' },
  { value: 'asc', label: 'Tăng dần' },
];

// Ngôn ngữ / Phụ đề
export type SortLangValue = 'vietsub' | 'thuyet-minh' | 'long-tieng';

export const SORT_LANG_OPTIONS: FilterOption<SortLangValue>[] = [
  { value: 'vietsub', label: 'Vietsub' },
  { value: 'thuyet-minh', label: 'Thuyết minh' },
  { value: 'long-tieng', label: 'Lồng tiếng' },
];

// Năm
const YEAR_START = 2000;

export function buildYearOptions(): FilterOption<string>[] {
  const currentYear = new Date().getFullYear();
  const options: FilterOption<string>[] = [];
  for (let y = currentYear; y >= YEAR_START; y--) {
    options.push({ value: String(y), label: String(y) });
  }
  return options;
}

export const YEAR_OPTIONS = buildYearOptions();

// Giá trị bộ lọc tất cả (không áp dụng bộ lọc)
export const FILTER_ALL_VALUE = '__all__' as const;

// Giao diện bộ lọc
export const FILTER_UI_COPY = {
  sortFieldLabel: 'Sắp xếp',
  sortTypeLabel: 'Thứ tự',
  sortLangLabel: 'Ngôn ngữ',
  yearLabel: 'Năm',
  resetAll: 'Xóa bộ lọc',
  allPlaceholder: 'Tất cả',
} as const;
