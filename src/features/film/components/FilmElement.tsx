'use client';

import { Play, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { forwardRef, useRef } from 'react';

import images from '@/assets/images';
import { resolveFilmImageUrl } from '@/lib/film-detail';
import { pushRoute } from '@/lib/route-navigation';

import { FILM_UI_COPY } from '../constants/film-ui.constants';
import { PREVIEW_DRAG_THRESHOLD_PX } from '../constants/preview.constants';
import { useFilmPreview } from '../hooks/useFilmPreview';
import {
  prefersTapToPreview,
  resolveFilmCardMetaPill,
  resolveFilmCardRating,
} from '../lib/film-card';
import { setShowPreview } from '../store/preview-film-store';
import type { Film } from '../types/film.types';

import FilmCardImage from './FilmCardImage';

export type FilmElementVariant = 'cinematic' | 'poster';

export interface FilmElementProps {
  data?: Partial<Film> | undefined;
  baseUrl?: string | undefined;
  /** Card layout used by sliders and poster grids. */
  variant?: FilmElementVariant;
  /** Loads the image eagerly. */
  imagePriority?: boolean;
}

const FilmElement = forwardRef<HTMLDivElement, FilmElementProps>(
  ({ data = {}, baseUrl = '', variant = 'cinematic', imagePriority = false }, ref) => {
    const router = useRouter();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
    const isDraggingRef = useRef(false);
    const isPointerDownRef = useRef(false);
    const isPoster = variant === 'poster';
    const { openPreview, cancel, scheduleHide } = useFilmPreview();

    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const posterUrl = resolveFilmImageUrl(data?.poster_url, baseUrl);
    const thumbUrl = resolveFilmImageUrl(data?.thumb_url, baseUrl) || posterUrl;
    const stickerPosterUrl = posterUrl || thumbUrl;
    const primaryImage = isPoster ? posterUrl || thumbUrl : thumbUrl;
    const { hasRating, voteAverage } = resolveFilmCardRating(data);
    const metaPill = resolveFilmCardMetaPill(data);

    const anchorFromEl = () => {
      const el = rootRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersTapToPreview()) return;
      if (isPoster) return;
      if (isPointerDownRef.current || isDraggingRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      openPreview({
        id: data?._id,
        slug: data?.slug,
        immediate: false,
        anchorRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
      });
    };

    const handleMouseLeave = () => {
      if (prefersTapToPreview()) return;
      if (!isPointerDownRef.current) {
        scheduleHide();
      } else {
        cancel();
      }
    };

    const navigateToFilm = () => {
      if (!data?.slug) return;
      setShowPreview(false);
      pushRoute(router, `/phim/${data.slug}`);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      isPointerDownRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;
      cancel();

      const onDocMove = (ev: PointerEvent) => {
        if (!pointerStartRef.current || isDraggingRef.current) return;
        const dx = Math.abs(ev.clientX - pointerStartRef.current.x);
        const dy = Math.abs(ev.clientY - pointerStartRef.current.y);
        if (dx > PREVIEW_DRAG_THRESHOLD_PX || dy > PREVIEW_DRAG_THRESHOLD_PX) {
          isDraggingRef.current = true;
          cancel();
        }
      };

      const onDocUp = () => {
        const wasDragging = isDraggingRef.current;
        isPointerDownRef.current = false;
        pointerStartRef.current = null;
        isDraggingRef.current = false;
        document.removeEventListener('pointermove', onDocMove);
        document.removeEventListener('pointerup', onDocUp);
        document.removeEventListener('pointercancel', onDocUp);

        if (wasDragging) return;

        if (prefersTapToPreview()) {
          openPreview({
            id: data?._id,
            slug: data?.slug,
            immediate: true,
            anchorRect: anchorFromEl(),
          });
          return;
        }

        navigateToFilm();
      };

      document.addEventListener('pointermove', onDocMove);
      document.addEventListener('pointerup', onDocUp);
      document.addEventListener('pointercancel', onDocUp);
    };

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (prefersTapToPreview()) {
        openPreview({
          id: data?._id,
          slug: data?.slug,
          immediate: true,
          anchorRect: anchorFromEl(),
        });
        return;
      }
      navigateToFilm();
    };

    const linkProps = {
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': data?.name || data?.slug || 'Xem phim',
      draggable: false,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onDragStart: (e: React.DragEvent) => e.preventDefault(),
      className: 'cursor-pointer outline-none',
    };

    const loadingAsset = images.imgLoadingVertical as string | { src?: string } | undefined;
    const placeholderSrc: string =
      typeof loadingAsset === 'string' ? loadingAsset : loadingAsset?.src || '';

    if (isPoster) {
      return (
        <div className="relative w-full select-none">
          <div
            ref={setRootRef}
            data-testid="film-card"
            data-slug={data?.slug || undefined}
            onPointerDown={handlePointerDown}
            className="group/film relative w-full"
          >
            <div {...linkProps}>
              <div className="relative mb-[8px] aspect-[2/3] w-full overflow-hidden rounded-[10px] bg-fill-secondary ring-1 ring-white/10">
                <FilmCardImage
                  src={primaryImage}
                  alt={data?.name ?? ''}
                  placeholderSrc={placeholderSrc}
                  priority={imagePriority}
                  className="transition-transform duration-300 group-hover/film:scale-[1.04]"
                />

                <div className="pointer-events-none absolute left-[8px] top-[8px] flex items-center gap-[4px]">
                  {data?.quality ? (
                    <span className="rounded-[5px] border border-white/10 bg-black/40 px-[6px] py-[2px] text-[10px] font-semibold text-white backdrop-blur-[6px]">
                      {String(data.quality).toUpperCase()}
                    </span>
                  ) : null}
                </div>

                {hasRating && voteAverage != null ? (
                  <div className="pointer-events-none absolute right-[8px] top-[8px] inline-flex items-center gap-[3px] rounded-[999px] bg-black/45 px-[7px] py-[2px] text-[12px] font-semibold text-[#fbbf24] backdrop-blur-[6px]">
                    <Star className="h-[11px] w-[11px] fill-current" />
                    {voteAverage.toFixed(1)}
                  </div>
                ) : null}

                <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/35 opacity-0 backdrop-blur-[10px] transition-opacity duration-200 group-hover/film:opacity-100 mdm:flex sm:flex">
                  <Play className="h-[42px] w-[42px] text-primary" />
                </div>
              </div>

              <h3 className="mb-[4px] line-clamp-2 text-[14.3px] font-medium leading-[1.3] text-primary">
                {data?.name}
              </h3>
              {metaPill ? (
                <p className="line-clamp-1 text-[12px] font-medium text-title">{metaPill}</p>
              ) : typeof data?.year === 'number' ? (
                <p className="text-[12px] font-medium text-title">{data.year}</p>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full">
        <div
          ref={setRootRef}
          data-testid="film-card"
          data-slug={data?.slug || undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onPointerDown={handlePointerDown}
          className="group/film relative w-full select-none"
        >
          <div {...linkProps}>
            <div className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-fill-secondary ring-1 ring-white/10">
              <FilmCardImage
                src={thumbUrl}
                alt={data?.name ?? ''}
                placeholderSrc={placeholderSrc}
                priority={imagePriority}
                className="transition-transform duration-[420ms] will-change-transform group-hover/film:scale-[1.06]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.22)] to-[rgba(0,0,0,0.10)]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.55)] via-transparent to-transparent" />

              <div className="pointer-events-none absolute left-[10px] top-[10px] flex items-center gap-[6px]">
                {data?.quality ? (
                  <span className="rounded-[6px] border border-white/10 bg-black/35 px-[7px] py-[3px] text-[10px] font-semibold text-white backdrop-blur-[6px]">
                    {String(data.quality).toUpperCase()}
                  </span>
                ) : null}
                {data?.lang ? (
                  <span className="rounded-[6px] border border-white/10 bg-black/35 px-[7px] py-[3px] text-[10px] font-semibold text-white backdrop-blur-[6px]">
                    {String(data.lang).toUpperCase()}
                  </span>
                ) : null}
              </div>

              {hasRating && voteAverage != null ? (
                <div className="pointer-events-none absolute right-[10px] top-[10px] inline-flex items-center gap-[4px] rounded-[999px] bg-[rgba(234,179,8,0.14)] px-[8px] py-[2px] text-xs font-semibold text-[#fbbf24] ring-1 ring-[rgba(234,179,8,0.18)]">
                  <Star className="h-[12px] w-[12px] fill-current" />
                  {voteAverage.toFixed(1)}
                </div>
              ) : null}

              <div className="pointer-events-none absolute bottom-[12px] left-[12px] right-[12px] flex items-end gap-[10px] sm:gap-[12px]">
                {stickerPosterUrl ? (
                  <div className="relative aspect-[2/3] w-[72px] shrink-0 overflow-hidden rounded-[10px] shadow-[0_18px_45px_-22px_rgba(0,0,0,0.88)] ring-1 ring-white/15 transition-transform duration-300 group-hover/film:translate-y-[-2px] sm:w-[88px]">
                    <FilmCardImage
                      src={stickerPosterUrl}
                      alt={data?.name ?? ''}
                      placeholderSrc={placeholderSrc}
                      priority={imagePriority}
                    />
                  </div>
                ) : null}

                <div className="min-w-0 flex-1 pb-[2px]">
                  <h3 className="line-clamp-2 text-[14px] font-semibold leading-[1.25] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-[15px]">
                    {data?.name}
                  </h3>
                  {typeof data?.year === 'number' ? (
                    <div className="mt-[4px] text-[12px] font-medium text-white/70">
                      {data.year}
                    </div>
                  ) : null}
                </div>

                {metaPill ? (
                  <div className="shrink-0 rounded-[999px] border border-white/10 bg-black/35 px-[10px] py-[3px] text-[10px] font-medium uppercase text-white backdrop-blur-[6px]">
                    {metaPill}
                  </div>
                ) : null}
              </div>

              <div className="pointer-events-none absolute inset-0 hidden items-center justify-center opacity-0 transition-opacity duration-300 group-hover/film:opacity-100 sm:flex">
                <div className="inline-flex items-center gap-[8px] rounded-[999px] bg-white/10 px-[14px] py-[10px] text-[12px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-[8px]">
                  <Play className="h-[16px] w-[16px] fill-current" />
                  {FILM_UI_COPY.watchNow}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FilmElement.displayName = 'FilmElement';

export default FilmElement;
