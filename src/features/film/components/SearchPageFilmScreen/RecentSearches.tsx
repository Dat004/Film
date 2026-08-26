'use client';

import { X, Trash2 } from 'lucide-react';

import { useRecentSearchStore } from '../../store/recent-search-store';

export interface RecentSearchesProps {
  onSelectKeyword: (keyword: string) => void;
}

export function RecentSearches({ onSelectKeyword }: RecentSearchesProps) {
  const { searches, removeSearch, clearAll } = useRecentSearchStore();

  if (searches.length === 0) return null;

  return (
    <div className="border-bd-filed-form-color">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-title">
          Tìm kiếm gần đây
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearAll();
          }}
          className="flex items-center gap-1 text-[11px] text-title hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 className="size-3" /> Xóa tất cả
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((keyword) => (
          <span
            key={keyword}
            onClick={() => onSelectKeyword(keyword)}
            className="inline-flex items-center gap-1.5 rounded-[4px] border border-bd-filed-form-color bg-bg-search-btn hover:bg-bg-odd-color px-2.5 py-1 text-[12.5px] text-primary cursor-pointer transition-colors select-none"
          >
            <span>{keyword}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSearch(keyword);
              }}
              className="text-title hover:text-primary transition-colors p-0.5"
              aria-label={`Xóa ${keyword}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default RecentSearches;
