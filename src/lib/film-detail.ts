import type { Episode, FilmDataResponse, FilmDetail } from '@/features/film/types/film.types';

const CDN_BASE = 'https://img.phimapi.com';

/** Normalize `/phim/{slug}` and v1 `data.item` payloads into `{ movie, episodes }`. */
export function normalizeFilmDetailResponse(raw: unknown): FilmDataResponse | null {
  if (!raw || typeof raw !== 'object') return null;

  const root = raw as Record<string, unknown>;
  const data = root.data;

  if (data && typeof data === 'object') {
    const dataObj = data as Record<string, unknown>;
    const movieNode = dataObj.item ?? dataObj.movie;
    if (movieNode && typeof movieNode === 'object') {
      const itemObj = movieNode as Record<string, unknown> & { episodes?: Episode[] };
      const { episodes, ...movieFields } = itemObj;
      return {
        movie: movieFields as unknown as FilmDetail,
        episodes: Array.isArray(episodes) ? episodes : [],
      };
    }
  }

  if (root.movie && typeof root.movie === 'object') {
    return {
      movie: root.movie as FilmDetail,
      episodes: Array.isArray(root.episodes) ? (root.episodes as Episode[]) : [],
    };
  }

  return null;
}

export function resolveFilmImageUrl(url?: string | null, baseUrl?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const base = (baseUrl || CDN_BASE).replace(/\/$/, '');
  return `${base}/${url.replace(/^\//, '')}`;
}

export function extractYoutubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }
    const v = parsed.searchParams.get('v');
    if (v) return v;
    const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch?.[1]) return embedMatch[1];
    return null;
  } catch {
    return null;
  }
}

/** Strip tags for plain-text previews (metadata, line clamp detection). */
export function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Minimal sanitize before rendering API HTML content. */
export function sanitizeFilmHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}
