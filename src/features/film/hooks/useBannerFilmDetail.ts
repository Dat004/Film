import type { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

import { normalizeFilmDetailResponse } from '@/lib/film-detail';
import { logger } from '@/lib/logger';

import { detailsFilmService } from '../services/film.service';
import type { FilmDetail } from '../types/film.types';

/** Lazy-load detail for active banner slide (description + trailer). */
export function useBannerFilmDetail(slug: string | undefined, enabled: boolean) {
  const [detail, setDetail] = useState<Partial<FilmDetail> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!slug || !enabled) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    detailsFilmService(slug)
      .then((response) => {
        if (cancelled) return;
        const normalized = normalizeFilmDetailResponse((response as AxiosResponse).data);
        setDetail(normalized?.movie ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.error(
          'Lỗi khi tải chi tiết banner',
          err instanceof Error ? err : new Error(String(err))
        );
        setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);

  return { detail, isLoading };
}
