'use client';

import { Film as FilmIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface FilmCardImageProps {
  src?: string | undefined;
  alt?: string | undefined;
  className?: string | undefined;
  placeholderSrc?: string | undefined;
  priority?: boolean | undefined;
  rootMargin?: string | undefined;
}

/** SVG Shimmer data URI placeholder for progressive blur-up loading */
const SHIMMER_PLACEHOLDER_SVG = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231a1a1e'/%3E%3Cstop offset='50%25' stop-color='%23282830'/%3E%3Cstop offset='100%25' stop-color='%231a1a1e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E`;

export default function FilmCardImage({
  src,
  alt = '',
  className,
  placeholderSrc = SHIMMER_PLACEHOLDER_SVG,
  priority = false,
  rootMargin = '200px 400px',
}: FilmCardImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (priority) {
      setShouldLoad(true);
      return;
    }
    if (!src || shouldLoad) return;

    const node = wrapRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const nearViewport = () => {
      const r = node.getBoundingClientRect();
      const vx = 400;
      const vy = 200;
      return (
        r.bottom >= -vy &&
        r.top <= window.innerHeight + vy &&
        r.right >= -vx &&
        r.left <= window.innerWidth + vx
      );
    };

    if (nearViewport()) {
      setShouldLoad(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting || e.intersectionRatio > 0)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );
    io.observe(node);

    const t1 = window.setTimeout(() => {
      if (nearViewport()) setShouldLoad(true);
    }, 80);

    return () => {
      io.disconnect();
      window.clearTimeout(t1);
    };
  }, [src, priority, shouldLoad, rootMargin]);

  const realSrc = shouldLoad && !hasError ? src : undefined;
  const showPlaceholder = !loaded && !hasError;

  /** Smart image loader with progressive blur-up, error fallbacks, and viewport detection */
  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-[#18181c]">
      {/* Progressive Shimmer / Blur Placeholder */}
      {showPlaceholder ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover blur-sm opacity-60 transition-opacity duration-300"
          draggable={false}
        />
      ) : null}

      {/* Error Fallback Icon when CDN fails */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1c22] text-title/40 p-4 select-none">
          <FilmIcon className="size-8 mb-1" />
          <span className="text-[11px] font-medium text-center truncate max-w-full">
            {alt || 'Phim'}
          </span>
        </div>
      ) : null}

      {/* Real Image with decoding="async" and progressive fade */}
      {realSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={realSrc}
          alt={alt}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setHasError(true);
            setLoaded(true);
          }}
          className={cn(
            'absolute inset-0 h-full w-full object-cover pointer-events-none transition-all duration-500 ease-out',
            loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105',
            className
          )}
        />
      ) : null}
    </div>
  );
}
