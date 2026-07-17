'use client';

import { useCallback, useEffect, useRef } from 'react';

import { logger } from '@/lib/logger';

import { findCachedPreview, isSamePreview, PREVIEW_HOVER_DELAY_MS } from '../lib/film-card';
import { mapApiMovieToFilmDetail } from '../lib/film-mappers';
import { detailsFilmService } from '../services/film.service';
import {
  usePreviewFilmStore,
  cancelHidePreview,
  scheduleHidePreview,
  setPreviewAnchor,
  setListPreviewData,
  beginPreviewSwap,
  commitPreviewData,
  setPreviewReadyFromCache,
} from '../store/preview-film-store';
import type { PreviewAnchorRect } from '../types/film.types';

export interface OpenPreviewOptions {
  id?: string | undefined;
  slug?: string | undefined;
  immediate?: boolean;
  anchorRect?: PreviewAnchorRect | null | undefined;
}

export function useFilmPreview() {
  const mouseEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listPreviewData = usePreviewFilmStore((state) => state.listPreviewData);

  const cancel = useCallback(() => {
    if (mouseEnterTimeoutRef.current) {
      clearTimeout(mouseEnterTimeoutRef.current);
      mouseEnterTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const fetchPreviewDetail = useCallback(async (requestId: number, slug: string) => {
    try {
      const res = (await detailsFilmService(slug)) as unknown as {
        status?: boolean;
        data?: { movie?: unknown };
      };
      if (res?.status && res?.data?.movie) {
        const movie = mapApiMovieToFilmDetail(res.data.movie);
        const applied = commitPreviewData(requestId, movie);
        if (applied) setListPreviewData(movie);
      } else {
        commitPreviewData(requestId, usePreviewFilmStore.getState().currentPreviewData);
      }
    } catch (err) {
      commitPreviewData(requestId, usePreviewFilmStore.getState().currentPreviewData);
      logger.error(
        'Lỗi khi tải dữ liệu preview phim',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, []);

  const openPreview = useCallback(
    ({ id, slug, immediate = false, anchorRect }: OpenPreviewOptions) => {
      cancelHidePreview();
      cancel();

      if (anchorRect) {
        setPreviewAnchor(anchorRect);
      }

      const current = usePreviewFilmStore.getState().currentPreviewData;
      const cached = findCachedPreview(listPreviewData, id, slug);

      const reveal = () => {
        if (cached) {
          setPreviewReadyFromCache(cached);
          return;
        }

        if (!slug) return;

        const requestId = beginPreviewSwap({});
        void fetchPreviewDetail(requestId, slug);
      };

      if (usePreviewFilmStore.getState().isShowPreview && !isSamePreview(current, id, slug)) {
        beginPreviewSwap({});
      }

      if (immediate) {
        reveal();
        return;
      }

      mouseEnterTimeoutRef.current = setTimeout(() => {
        reveal();
      }, PREVIEW_HOVER_DELAY_MS);
    },
    [cancel, fetchPreviewDetail, listPreviewData]
  );

  const scheduleOpen = useCallback(
    (opts: Omit<OpenPreviewOptions, 'immediate'>) => {
      openPreview({ ...opts, immediate: false });
    },
    [openPreview]
  );

  const scheduleHide = useCallback(() => {
    cancel();
    scheduleHidePreview();
  }, [cancel]);

  return {
    openPreview,
    scheduleOpen,
    cancel,
    scheduleHide,
    cancelHide: cancelHidePreview,
  };
}
