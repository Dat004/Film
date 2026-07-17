import { BANNER_FILM_LIMIT } from '../constants/banner.constants';
import type { Film } from '../types/film.types';

export type DanhSachV1Type = 'phim-le' | 'phim-bo' | 'hoat-hinh' | 'tv-shows';

export interface BannerDanhSachQuery {
  type: DanhSachV1Type;
  category?: string;
  country?: string;
}

export { BANNER_FILM_LIMIT };

/**
 * Map catalog service → banner query when page > 1 (page 1 reuses the grid).
 * Home + Phim mới dùng `danh-sach` không type — xử lý riêng trong useCategoryFilm.
 */
export function resolveBannerDanhSachQuery(
  requestName: string,
  slug?: string
): BannerDanhSachQuery {
  switch (requestName) {
    case 'singleFilmService':
      return { type: 'phim-le' };
    case 'seriesFilmService':
      return { type: 'phim-bo' };
    case 'cartoonService':
      return { type: 'hoat-hinh' };
    case 'tvShowService':
      return { type: 'tv-shows' };
    case 'newFilmService':
      // Fallback only; page 1 reuses grid from danhSachService.
      return { type: 'phim-bo' };
    case 'categoryFilmService':
      return slug ? { type: 'phim-bo', category: slug } : { type: 'phim-bo' };
    case 'countryFilmService':
      return slug ? { type: 'phim-le', country: slug } : { type: 'phim-le' };
    default:
      return { type: 'phim-bo' };
  }
}

function bannerScore(film: Partial<Film>): number {
  const vote = film.tmdb?.vote_average ?? 0;
  const chieurapBoost = film.chieurap ? 3 : 0;
  const thumbBoost = film.thumb_url ? 2 : 0;
  const posterBoost = film.poster_url ? 1 : 0;
  return vote * 10 + chieurapBoost + thumbBoost + posterBoost;
}

/** Selects banner slides by rating, image availability, and theater status. */
export function pickBannerFilms(
  items: Partial<Film>[] | null | undefined,
  limit: number = BANNER_FILM_LIMIT
): Partial<Film>[] {
  if (!items?.length) return [];

  const ranked = items
    .filter((film) => film.slug && (film.thumb_url || film.poster_url))
    .map((film) => ({ film, score: bannerScore(film) }))
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const result: Partial<Film>[] = [];

  for (const { film } of ranked) {
    const slug = film.slug!;
    if (seen.has(slug)) continue;
    seen.add(slug);
    result.push(film);
    if (result.length >= limit) break;
  }

  return result;
}

export type BannerDataPayload = {
  itemsBanner: Partial<Film>[] | null;
  APP_DOMAIN_CDN_IMAGE?: string;
};

/** Build banner payload from normalized v1 list response. */
export function buildBannerDataPayload(
  raw: Record<string, unknown> | null | undefined
): BannerDataPayload {
  if (!raw) {
    return { itemsBanner: null };
  }

  const items = raw.items as Partial<Film>[] | undefined;
  const cdn = raw.APP_DOMAIN_CDN_IMAGE as string | undefined;

  return {
    itemsBanner: pickBannerFilms(items),
    ...(cdn ? { APP_DOMAIN_CDN_IMAGE: cdn } : {}),
  };
}
