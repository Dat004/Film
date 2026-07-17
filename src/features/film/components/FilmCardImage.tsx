'use client';

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

/** Image loader that remains reliable inside transformed Swiper slides. */
export default function FilmCardImage({
  src,
  alt = '',
  className,
  placeholderSrc,
  priority = false,
  rootMargin = '160px 360px',
}: FilmCardImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
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
      const vx = 360;
      const vy = 160;
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
    const t2 = window.setTimeout(() => {
      if (nearViewport()) setShouldLoad(true);
    }, 320);

    return () => {
      io.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [src, priority, shouldLoad, rootMargin]);

  const realSrc = shouldLoad ? src : undefined;
  const showPlaceholder = Boolean(placeholderSrc) && (!realSrc || !loaded);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-white/[0.04]">
      {showPlaceholder ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          draggable={false}
        />
      ) : null}

      {realSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={realSrc}
          alt={alt}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      ) : null}
    </div>
  );
}
