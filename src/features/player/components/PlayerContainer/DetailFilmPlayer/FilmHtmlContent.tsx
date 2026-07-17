'use client';

import { ChevronDown, X } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { sanitizeFilmHtml, stripHtmlToText } from '@/lib/film-detail';
import { cn } from '@/lib/utils';

export interface FilmHtmlContentProps {
  html?: string | undefined;
  lineClamp?: number;
}

const contentClassName =
  'film-html-content text-[14px] font-normal text-primary/90 leading-[1.65] whitespace-normal break-words [&_p]:mb-[8px] [&_p]:whitespace-normal [&_p]:overflow-visible [&_p:last-child]:mb-0 [&_strong]:text-primary [&_b]:text-primary';

const FilmHtmlContent: React.FC<FilmHtmlContentProps> = ({ html = '', lineClamp = 4 }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const safeHtml = html ? sanitizeFilmHtml(html) : '';
  const plainText = safeHtml ? stripHtmlToText(safeHtml) : '';

  useEffect(() => {
    const clampedEl = contentRef.current;
    const measureEl = measureRef.current;

    if (!clampedEl || !measureEl || !safeHtml) {
      setIsOverflowing(false);
      return;
    }

    const checkOverflow = () => {
      // Compare the full content height with its clamped height.
      const fullHeight = measureEl.scrollHeight;
      const visibleHeight = clampedEl.clientHeight;
      setIsOverflowing(fullHeight > visibleHeight + 2);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(clampedEl);
    observer.observe(measureEl);

    return () => observer.disconnect();
  }, [safeHtml, lineClamp]);

  if (!plainText) {
    return <p className="text-[14px] text-primary/70">Đang cập nhật</p>;
  }

  return (
    <>
      <div className="relative w-full">
        {/* Hidden copy used to measure the full content height. */}
        <div
          ref={measureRef}
          aria-hidden="true"
          className={cn(
            contentClassName,
            'invisible absolute inset-x-0 top-0 -z-10 pointer-events-none'
          )}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        <div
          ref={contentRef}
          className={contentClassName}
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: lineClamp,
            overflow: 'hidden',
          }}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </div>

      {isOverflowing && (
        <button
          type="button"
          aria-label="Xem thêm mô tả"
          onClick={() => setIsModalOpen(true)}
          className="mt-[12px] inline-flex items-center gap-[4px] rounded-[6px] border border-bd-filed-form-color bg-bg-field px-[12px] py-[6px] text-[13px] font-semibold text-primary transition-colors hover:border-hover hover:text-hover"
        >
          Xem thêm
          <ChevronDown className="w-[14px] h-[14px]" />
        </button>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="modal-panel-surface mx-auto max-w-[640px] w-[90vw] rounded-[10px] overflow-hidden bg-bg-sidebar border border-bd-filed-form-color p-0">
          <DialogTitle className="sr-only">Nội dung phim</DialogTitle>
          <div className="flex items-center justify-between p-[12px] border-b border-bd-filed-form-color">
            <span className="text-[15px] font-semibold text-primary">Nội dung phim</span>
            <Button rounded aria-label="Đóng" onClick={() => setIsModalOpen(false)}>
              <X className="text-[18px]" />
            </Button>
          </div>
          <div
            className={`${contentClassName} max-h-[60vh] overflow-auto p-[20px] [&_p]:mb-[10px]`}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FilmHtmlContent;
