'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';

import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';

import type { Film } from '../types/film.types';

import FilmElement from './FilmElement';

export interface VirtualFilmGridProps {
  items: Partial<Film>[];
  baseUrl?: string | undefined;
  isLoadingMore?: boolean | undefined;
  hasMore?: boolean | undefined;
  onLoadMore?: (() => void) | undefined;
  className?: string | undefined;
}

export function VirtualFilmGrid({
  items,
  baseUrl,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  className,
}: VirtualFilmGridProps) {
  const [columns, setColumns] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive column detection matching project CSS breakpoints:
  // Desktop-first: >991px (3 cols) | 576px-991px (2 cols) | <576px (1 col)
  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w <= 576) {
        setColumns(1);
      } else if (w <= 991) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Divide items into row chunks
  const rows = useMemo(() => {
    const result: Partial<Film>[][] = [];
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns));
    }
    return result;
  }, [items, columns]);

  // Estimated row height based on columns
  const estimateRowHeight = useMemo(() => {
    if (columns === 1) return 420;
    if (columns === 2) return 360;
    return 320;
  }, [columns]);

  // Setup window virtualizer from @tanstack/react-virtual
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => estimateRowHeight,
    overscan: 3,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // Trigger infinite scroll loadMore when scrolling near the end
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;
    const lastVirtualRow = virtualRows[virtualRows.length - 1];
    if (!lastVirtualRow) return;

    if (lastVirtualRow.index >= rows.length - 2) {
      onLoadMore();
    }
  }, [virtualRows, rows.length, onLoadMore, hasMore, isLoadingMore]);

  if (items.length === 0) return null;

  return (
    <div ref={containerRef} className={className}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const rowItems = rows[virtualRow.index] ?? [];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <FlexContainer className="mx-[-12px] pb-[24px] items-start">
                {rowItems.map((film, colIndex) => (
                  <FlexItems
                    key={film?._id || film?.slug || `${virtualRow.index}-${colIndex}`}
                    className={
                      columns === 3
                        ? 'w-[calc(100%/3)] px-[12px]'
                        : columns === 2
                          ? 'w-[calc(100%/2)] px-[12px]'
                          : 'w-[100%] px-[12px]'
                    }
                  >
                    <FilmElement
                      data={film}
                      baseUrl={baseUrl}
                      imagePriority={virtualRow.index === 0}
                    />
                  </FlexItems>
                ))}
              </FlexContainer>
            </div>
          );
        })}
      </div>

      {/* Infinite Scroll Loading Indicator */}
      {isLoadingMore ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 rounded-full bg-bg-sidebar px-4 py-2 border border-bd-filed-form-color shadow-lg">
            <Loader2 className="size-5 text-[var(--hover-color)] animate-spin" />
            <span className="text-[12px] font-semibold text-primary">Đang tải thêm phim...</span>
          </div>
        </div>
      ) : null}

      {/* End of list indicator */}
      {!hasMore && !isLoadingMore && items.length > 0 ? (
        <div className="flex items-center justify-center py-8 text-[12.5px] font-medium text-title select-none">
          <span className="rounded-full bg-bg-sidebar px-4 py-1.5 text-xs leading-1 border border-bd-filed-form-color">
            Đã hiển thị tất cả phim
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default VirtualFilmGrid;
