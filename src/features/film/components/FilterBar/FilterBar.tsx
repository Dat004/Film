'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { cn } from '@/lib/utils';

import {
  FILTER_ALL_VALUE,
  FILTER_UI_COPY,
  SORT_FIELD_OPTIONS,
  SORT_TYPE_OPTIONS,
  SORT_LANG_OPTIONS,
  YEAR_OPTIONS,
} from '../../constants/filter.constants';
import type { CatalogFilterParams } from '../../lib/filter-schemas';

export interface FilterBarProps {
  filters: CatalogFilterParams;
  activeCount: number;
  onFilterChange: (key: keyof CatalogFilterParams, value: string | number | undefined) => void;
  onReset: () => void;
  className?: string;
}

export default function FilterBar({
  filters,
  activeCount,
  onFilterChange,
  onReset,
  className,
}: FilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={cn('mb-[24px] flex flex-wrap justify-end items-center gap-[10px]', className)}>
      {/* Trigger Button (Matching FilmHtmlContent style) */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-[6px] rounded-[6px] border border-bd-filed-form-color bg-bg-field px-[14px] py-[8px] text-[13px] font-semibold text-primary transition-colors hover:border-[var(--hover-color)] hover:text-[var(--hover-color)] cursor-pointer select-none"
      >
        <SlidersHorizontal className="w-[15px] h-[15px] text-[var(--hover-color)]" />
        <span>Bộ lọc phim</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-[var(--hover-color)]/20 px-[8px] py-[2px] text-xs font-bold text-[var(--hover-color)]">
            {activeCount}
          </span>
        )}
      </button>

      {/* Modal Dialog (100% Synced with FilmHtmlContent Dialog style) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="modal-panel-surface mx-auto max-w-[560px] w-[90vw] rounded-[10px] overflow-hidden bg-bg-sidebar border border-bd-filed-form-color p-0">
          <DialogTitle className="sr-only">Bộ lọc phim</DialogTitle>

          {/* Modal Header */}
          <div className="flex items-center justify-between p-[16px] border-b border-bd-filed-form-color">
            <span className="text-[15px] font-semibold text-primary flex items-center gap-[8px]">
              Bộ lọc phim
            </span>
            <Button rounded aria-label="Đóng" onClick={() => setIsModalOpen(false)}>
              <X className="text-[18px]" />
            </Button>
          </div>

          {/* Modal Body Form */}
          <div className="p-[20px]">
            <div className="grid grid-cols-2 mdm:grid-cols-1 gap-[16px] mb-[20px]">
              {/* Field 1: Sắp xếp theo */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-title">Sắp xếp theo</label>
                <Select
                  value={filters.sort_field || FILTER_ALL_VALUE}
                  onValueChange={(v) =>
                    onFilterChange('sort_field', v === FILTER_ALL_VALUE ? '' : v)
                  }
                >
                  <SelectTrigger className="h-[40px] bg-bg-field border-bd-filed-form-color text-[13px]">
                    <SelectValue placeholder={FILTER_UI_COPY.allPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL_VALUE}>
                      {FILTER_UI_COPY.allPlaceholder}
                    </SelectItem>
                    {SORT_FIELD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Field 2: Thứ tự */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-title">Thứ tự sắp xếp</label>
                <Select
                  value={filters.sort_type || FILTER_ALL_VALUE}
                  onValueChange={(v) =>
                    onFilterChange('sort_type', v === FILTER_ALL_VALUE ? '' : v)
                  }
                >
                  <SelectTrigger className="h-[40px] bg-bg-field border-bd-filed-form-color text-[13px]">
                    <SelectValue placeholder={FILTER_UI_COPY.allPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL_VALUE}>
                      {FILTER_UI_COPY.allPlaceholder}
                    </SelectItem>
                    {SORT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Field 3: Ngôn ngữ */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-title">Ngôn ngữ / Phụ đề</label>
                <Select
                  value={filters.sort_lang || FILTER_ALL_VALUE}
                  onValueChange={(v) =>
                    onFilterChange('sort_lang', v === FILTER_ALL_VALUE ? '' : v)
                  }
                >
                  <SelectTrigger className="h-[40px] bg-bg-field border-bd-filed-form-color text-[13px]">
                    <SelectValue placeholder={FILTER_UI_COPY.allPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL_VALUE}>
                      {FILTER_UI_COPY.allPlaceholder}
                    </SelectItem>
                    {SORT_LANG_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Field 4: Năm sản xuất */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-title">Năm phát hành</label>
                <Select
                  value={filters.year ? String(filters.year) : FILTER_ALL_VALUE}
                  onValueChange={(v) =>
                    onFilterChange('year', v === FILTER_ALL_VALUE ? undefined : Number(v))
                  }
                >
                  <SelectTrigger className="h-[40px] bg-bg-field border-bd-filed-form-color text-[13px]">
                    <SelectValue placeholder={FILTER_UI_COPY.allPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL_VALUE}>
                      {FILTER_UI_COPY.allPlaceholder}
                    </SelectItem>
                    {YEAR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex gap-[12px] pt-[16px] border-t border-bd-filed-form-color">
              <button
                type="button"
                onClick={onReset}
                className="h-[40px] flex-1 rounded-[6px] border border-bd-filed-form-color bg-bg-field text-[13.5px] font-semibold text-primary transition-colors hover:border-hover hover:text-hover cursor-pointer"
              >
                Xóa bộ lọc
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-[40px] flex-1 rounded-[6px] bg-bg-btn-primary text-[13.5px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
