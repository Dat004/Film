export interface FilmCategory {
  id?: string;
  name: string;
  slug: string;
}

export interface FilmCountry {
  id?: string;
  name: string;
  slug: string;
}

export interface Film {
  _id: string;
  name: string;
  origin_name?: string;
  slug: string;
  type: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  time?: string;
  episode_current?: string;
  quality?: string;
  lang?: string;
  chieurap?: boolean;
  category?: FilmCategory[];
  country?: FilmCountry[];
  tmdb?: {
    id?: string;
    type?: string;
    season?: number | null;
    vote_average?: number;
    vote_count?: number;
  };
  modified?: {
    time?: string;
  };
}

export interface FilmDetail extends Film {
  content: string;
  status: string;
  category: FilmCategory[];
  country: FilmCountry[];
  actor: string[];
  director: string[];
  duration?: string;
  episode_total: string | number;
  view: number;
  tmdb?: {
    id?: string;
    type?: string;
    season?: number | null;
    vote_average?: number;
    vote_count?: number;
  };
  imdb?: {
    id?: string | null;
    vote_average?: number;
    vote_count?: number;
  };
  trailer_url?: string;
  alternative_names?: string[];
  notify?: string;
  showtimes?: string;
  lang_key?: string[];
  sub_docquyen?: boolean;
  is_copyright?: boolean;
  is_published?: boolean;
}

export interface FilmPerson {
  name?: string;
  character?: string;
  job?: string;
  department?: string;
  profile_path?: string;
  profile_url?: string;
  tmdb_id?: number;
}

export interface FilmKeyword {
  id?: number;
  name?: string;
}

export interface FilmImagesData {
  backdrops?: string[];
  posters?: string[];
  profile_sizes?: Record<string, string>;
}

/** Slide trong gallery extras (poster / backdrop) */
export type GallerySlide = {
  url: string;
  kind: 'poster' | 'backdrop';
};

export type GalleryLightboxState = {
  list: string[];
  index: number;
};

export const GALLERY_SLIDE_LIMIT = 16;
export const GALLERY_SLIDE_SPEED_MS = 480;

export interface EpisodeServerData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface Episode {
  server_name: string;
  server_data: EpisodeServerData[];
  is_ai?: boolean;
}

export interface FilmDataResponse {
  movie: FilmDetail;
  episodes: Episode[];
}

export interface PreviewAnchorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PreviewFilmState {
  isShowPreview: boolean;
  /** True while fetching detail for a newly selected card (hide stale content). */
  isPreviewLoading: boolean;
  previewRequestId: number;
  currentPreviewData: Partial<FilmDetail>;
  listPreviewData: Partial<FilmDetail>[];
  anchorRect: PreviewAnchorRect | null;
  setShowPreview: (payload: boolean) => void;
  setCurrentPreviewData: (payload: Partial<FilmDetail>) => void;
  setPreviewAnchor: (payload: PreviewAnchorRect | null) => void;
  setListPreviewData: (payload: Partial<FilmDetail>) => void;
  /** Clears stale preview content and bumps the request id. */
  beginPreviewSwap: (seed?: Partial<FilmDetail>) => number;
  commitPreviewData: (requestId: number, payload: Partial<FilmDetail>) => boolean;
  setPreviewReadyFromCache: (payload: Partial<FilmDetail>) => number;
}
