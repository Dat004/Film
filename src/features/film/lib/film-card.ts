import { PREVIEW_HOVER_DELAY_MS, PREVIEW_TAP_MAX_WIDTH_PX } from '../constants/preview.constants';
import type { Film, FilmDetail } from '../types/film.types';

/** Opens previews on tap for devices without reliable hover support. */
export function prefersTapToPreview(): boolean {
  if (typeof window === 'undefined') return false;
  const coarse =
    window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches;
  return coarse || window.innerWidth <= PREVIEW_TAP_MAX_WIDTH_PX;
}

export function findCachedPreview(list: Partial<FilmDetail>[], id?: string, slug?: string) {
  return list.find((item) => {
    if (id && item._id === id) return true;
    if (slug && item.slug === slug) return true;
    return false;
  });
}

export function isSamePreview(current: Partial<FilmDetail>, id?: string, slug?: string): boolean {
  if (id && current._id === id) return true;
  if (slug && current.slug === slug) return true;
  return false;
}

export function resolveFilmCardRating(data?: Partial<Film>): {
  hasRating: boolean;
  voteAverage: number | null;
} {
  const tmdbAvg = data?.tmdb?.vote_average;
  const hasRating = typeof tmdbAvg === 'number' && tmdbAvg > 0;
  return { hasRating, voteAverage: hasRating ? tmdbAvg! : null };
}

export function resolveFilmCardMetaPill(data?: Partial<Film>): string {
  return (
    data?.episode_current ||
    data?.time ||
    (typeof data?.year === 'number' ? String(data.year) : '') ||
    ''
  );
}

export { PREVIEW_HOVER_DELAY_MS };
