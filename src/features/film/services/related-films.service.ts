import type { Film } from '@/features/film/types/film.types';
import { extractListItems } from '@/lib/api-normalize';
import { extractFilmKeywords } from '@/lib/film-detail-extras';

import { categoryFilmService, filmKeywordsService, searchFilmService } from './film.service';

const RELATED_LIMIT = 12;
const MAX_KEYWORD_SEARCHES = 5;
const MAX_CATEGORY_FETCHES = 4;
const MIN_PER_CATEGORY = 4;

export interface RelatedFilmsResult {
  items: Partial<Film>[];
  cdnBase: string;
  moreLink: string;
}

function extractSearchPayload(responseData: unknown): {
  items: Partial<Film>[];
  cdnBase: string;
} {
  const payload = responseData as Record<string, unknown>;
  const data = payload?.data as Record<string, unknown> | undefined;
  const items = extractListItems(data ?? payload) as Partial<Film>[];
  const cdnBase = (data?.APP_DOMAIN_CDN_IMAGE as string) || '';
  return { items, cdnBase };
}

async function fetchByKeywords(
  filmSlug: string,
  currentSlug: string
): Promise<RelatedFilmsResult | null> {
  try {
    const keywordsPayload = await filmKeywordsService(filmSlug);
    const keywords = extractFilmKeywords(keywordsPayload)
      .map((kw) => kw.name?.trim())
      .filter((name): name is string => Boolean(name));

    if (keywords.length === 0) return null;

    const seen = new Set<string>();
    const results: Partial<Film>[] = [];
    let cdnBase = '';
    const primaryKeyword = keywords[0];

    // Limit parallel requests to keep the related section responsive.
    const keywordSlice = keywords.slice(0, MAX_KEYWORD_SEARCHES);
    const responses = await Promise.all(
      keywordSlice.map(async (keyword) => {
        try {
          const response = await searchFilmService({ keyword, limit: 10, page: 1 });
          return extractSearchPayload(response.data);
        } catch {
          return { items: [] as Partial<Film>[], cdnBase: '' };
        }
      })
    );

    for (const { items, cdnBase: searchCdn } of responses) {
      if (!cdnBase && searchCdn) cdnBase = searchCdn;
      for (const film of items) {
        if (!film.slug || film.slug === currentSlug || seen.has(film.slug)) continue;
        seen.add(film.slug);
        results.push(film);
        if (results.length >= RELATED_LIMIT) break;
      }
      if (results.length >= RELATED_LIMIT) break;
    }

    if (results.length === 0 || !primaryKeyword) return null;

    return {
      items: results.slice(0, RELATED_LIMIT),
      cdnBase,
      moreLink: `/search?value=${encodeURIComponent(primaryKeyword)}&limit=20`,
    };
  } catch {
    return null;
  }
}

async function fetchByCategories(
  categorySlugs: string[],
  currentSlug: string
): Promise<RelatedFilmsResult | null> {
  const uniqueSlugs = [...new Set(categorySlugs.filter(Boolean))].slice(0, MAX_CATEGORY_FETCHES);
  if (uniqueSlugs.length === 0) return null;

  const perCategoryLimit = Math.max(
    MIN_PER_CATEGORY,
    Math.ceil(RELATED_LIMIT / uniqueSlugs.length)
  );

  const responses = await Promise.all(
    uniqueSlugs.map(async (slug) => {
      try {
        const response = await categoryFilmService(null, {
          slug,
          limit: perCategoryLimit,
          page: 1,
        });
        const { items, cdnBase } = extractSearchPayload(response.data);
        return { slug, items, cdnBase };
      } catch {
        return { slug, items: [] as Partial<Film>[], cdnBase: '' };
      }
    })
  );

  const seen = new Set<string>();
  const results: Partial<Film>[] = [];
  let cdnBase = '';

  const buckets = responses.map((entry) => {
    if (!cdnBase && entry.cdnBase) cdnBase = entry.cdnBase;
    return entry.items.filter((film) => film.slug && film.slug !== currentSlug);
  });

  // Interleave categories instead of exhausting one source first.
  let round = 0;
  while (results.length < RELATED_LIMIT) {
    let addedInRound = false;

    for (const bucket of buckets) {
      const film = bucket[round];
      if (!film?.slug || seen.has(film.slug)) continue;

      seen.add(film.slug);
      results.push(film);
      addedInRound = true;

      if (results.length >= RELATED_LIMIT) break;
    }

    if (!addedInRound) break;
    round += 1;
  }

  if (results.length === 0) return null;

  return {
    items: results,
    cdnBase,
    moreLink: `/the-loai/${uniqueSlugs[0]}`,
  };
}

/** Uses keyword matches first, then falls back to category results. */
export async function fetchRelatedFilms(
  filmSlug: string,
  currentSlug: string,
  categorySlugs: string[] = []
): Promise<RelatedFilmsResult | null> {
  const byKeywords = await fetchByKeywords(filmSlug, currentSlug);
  if (byKeywords) return byKeywords;

  if (categorySlugs.length > 0) {
    return fetchByCategories(categorySlugs, currentSlug);
  }

  return null;
}
