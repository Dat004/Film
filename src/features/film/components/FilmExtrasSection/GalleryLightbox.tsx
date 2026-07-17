'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

export interface GalleryLightboxProps {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  reduceMotion: boolean;
}

export default function GalleryLightbox({
  images,
  index,
  onIndexChange,
  onClose,
  reduceMotion,
}: GalleryLightboxProps) {
  const total = images.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (total < 1) return;
      onIndexChange((((index + delta) % total) + total) % total);
    },
    [index, total, onIndexChange]
  );

  useEffect(() => {
    if (total < 2) return;
    const next = images[(index + 1) % total];
    const prev = images[(index - 1 + total) % total];
    for (const src of [next, prev]) {
      if (!src) continue;
      const img = new window.Image();
      img.src = src;
    }
  }, [images, index, total]);

  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, onClose, go]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh toàn màn hình"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.96)',
      }}
    >
      <div
        className="relative flex h-full w-full flex-col items-center justify-center px-[56px] py-[56px]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start == null || total < 2) return;
          const end = e.changedTouches[0]?.clientX;
          if (end == null) return;
          const dx = end - start;
          if (Math.abs(dx) < 48) return;
          go(dx < 0 ? 1 : -1);
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: '16px 20px',
          }}
        >
          <span className="text-[11px] tracking-[0.2em] font-semibold text-white/70">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-[10px] bg-white/10 px-[12px] py-[7px] text-[12px] font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Đóng (Esc)
          </button>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[index]}
          src={images[index]}
          alt={`Ảnh ${index + 1} / ${total}`}
          className={cn(
            'max-h-[85vh] max-w-[min(92vw,720px)] object-contain rounded-[8px]',
            !reduceMotion && 'animate-[fadeIn_.25s_ease-out]'
          )}
          draggable={false}
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={() => go(-1)}
              style={{
                position: 'fixed',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
              }}
              className="rounded-full bg-white/10 hover:bg-white/20 text-white w-[44px] h-[44px] flex items-center justify-center transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Ảnh sau"
              onClick={() => go(1)}
              style={{
                position: 'fixed',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
              }}
              className="rounded-full bg-white/10 hover:bg-white/20 text-white w-[44px] h-[44px] flex items-center justify-center transition-colors"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {!reduceMotion ? (
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        `}</style>
      ) : null}
    </div>,
    document.body
  );
}
