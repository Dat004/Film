import type { Film, FilmCategory, FilmCountry, FilmDetail } from '../types/film.types';

/** Maps list payloads to fields used by cards and sliders. */
export function mapApiMovieToFilm(movie: unknown): Partial<Film> {
  if (!movie || typeof movie !== 'object') return {};
  const m = movie as Record<string, unknown>;

  const film: Partial<Film> = {};
  if (typeof m._id === 'string') film._id = m._id;
  if (typeof m.name === 'string') film.name = m.name;
  if (typeof m.origin_name === 'string') film.origin_name = m.origin_name;
  if (typeof m.slug === 'string') film.slug = m.slug;
  if (typeof m.type === 'string') film.type = m.type;
  if (typeof m.poster_url === 'string') film.poster_url = m.poster_url;
  if (typeof m.thumb_url === 'string') film.thumb_url = m.thumb_url;
  if (typeof m.year === 'number') film.year = m.year;
  if (typeof m.time === 'string') film.time = m.time;
  if (typeof m.episode_current === 'string') film.episode_current = m.episode_current;
  if (typeof m.quality === 'string') film.quality = m.quality;
  if (typeof m.lang === 'string') film.lang = m.lang;
  if (typeof m.chieurap === 'boolean') film.chieurap = m.chieurap;
  if (Array.isArray(m.category)) {
    film.category = m.category as FilmCategory[];
  }
  if (Array.isArray(m.country)) {
    film.country = m.country as FilmCountry[];
  }
  if (m.tmdb && typeof m.tmdb === 'object') {
    film.tmdb = m.tmdb as NonNullable<Film['tmdb']>;
  }
  return film;
}

/** Preserves fields required by film details and previews. */
export function mapApiMovieToFilmDetail(movie: unknown): Partial<FilmDetail> {
  if (!movie || typeof movie !== 'object') return {};
  return { ...(movie as Partial<FilmDetail>) };
}

export function mapApiMovieList(items: unknown): Partial<Film>[] {
  if (!Array.isArray(items)) return [];
  return items.map(mapApiMovieToFilm);
}
