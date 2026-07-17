import type { FilmPerson, FilmKeyword } from '@/features/film/types/film.types';

export function extractFilmPeoples(payload: unknown): FilmPerson[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === 'object') {
    const peoples = (data as Record<string, unknown>).peoples;
    if (Array.isArray(peoples)) return peoples as FilmPerson[];
  }
  if (Array.isArray(root.peoples)) return root.peoples as FilmPerson[];
  return [];
}

export function extractFilmKeywords(payload: unknown): FilmKeyword[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === 'object') {
    const keywords = (data as Record<string, unknown>).keywords;
    if (Array.isArray(keywords)) {
      // The API may return keyword objects or plain strings.
      return keywords
        .map((kw) => {
          if (typeof kw === 'string') return { name: kw } satisfies FilmKeyword;
          if (kw && typeof kw === 'object') return kw as FilmKeyword;
          return null;
        })
        .filter((kw): kw is FilmKeyword => Boolean(kw));
    }
  }
  if (Array.isArray(root.keywords)) {
    return (root.keywords as unknown[])
      .map((kw) =>
        typeof kw === 'string' ? ({ name: kw } satisfies FilmKeyword) : (kw as FilmKeyword)
      )
      .filter((kw): kw is FilmKeyword => Boolean(kw));
  }
  return [];
}

type TmdbImageItem = {
  type?: string;
  file_path?: string;
};

function buildTmdbImageUrl(
  filePath: string,
  sizes?: Record<string, Record<string, string>>,
  kind: 'backdrop' | 'poster' = 'backdrop'
): string | null {
  const base = sizes?.[kind]?.w1280 || sizes?.[kind]?.w780 || sizes?.[kind]?.original;
  if (base) return `${base}${filePath}`;
  if (filePath.startsWith('http')) return filePath;
  return null;
}

export function extractFilmImages(payload: unknown): { backdrops: string[]; posters: string[] } {
  if (!payload || typeof payload !== 'object') return { backdrops: [], posters: [] };
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (!data || typeof data !== 'object') return { backdrops: [], posters: [] };

  const dataObj = data as Record<string, unknown>;
  const images = dataObj.images;
  if (!Array.isArray(images)) return { backdrops: [], posters: [] };

  const sizes = dataObj.image_sizes as Record<string, Record<string, string>> | undefined;

  const backdrops: string[] = [];
  const posters: string[] = [];

  for (const img of images) {
    if (typeof img === 'string') {
      // Untyped image URLs are treated as backdrops.
      backdrops.push(img);
      continue;
    }
    if (!img || typeof img !== 'object') continue;

    const typed = img as TmdbImageItem;
    const file = typed.file_path;
    if (!file || typeof file !== 'string') continue;

    const kind = typed.type === 'poster' ? 'poster' : 'backdrop';
    const url = buildTmdbImageUrl(file, sizes, kind);
    if (!url) continue;

    if (kind === 'poster') posters.push(url);
    else backdrops.push(url);
  }

  return { backdrops, posters };
}

/** Compatibility helper for callers that only consume backdrops. */
export function extractFilmBackdrops(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') return [];
  return extractFilmImages(payload).backdrops;
}

export function buildPersonProfileUrl(
  person: FilmPerson,
  profileSizes?: Record<string, string>
): string | null {
  if (person.profile_url) return person.profile_url;
  if (person.profile_path && profileSizes?.w185) {
    return `${profileSizes.w185}${person.profile_path}`;
  }
  return null;
}
