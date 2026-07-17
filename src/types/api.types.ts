export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  pagination?: Pagination;
}

export interface AppErrorDetails {
  [key: string]: string[];
}

export interface FilmListParams {
  type_list: string;
  slug: string;
  filterCategory: string[];
  filterCountry: string[];
  filterYear: string;
  filterType: string;
  sortField: string;
  sortType: string;
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface FilmListResponseData<T> {
  items: T[];
  params: FilmListParams;
  APP_DOMAIN_CDN_IMAGE: string;
  seoOnPage?: unknown;
  breadCrumb?: unknown[];
  titlePage?: string;
}

export interface FilmListApiResponse<T> {
  status: string;
  message?: string;
  data: FilmListResponseData<T>;
}

export interface ContinueWatchingEpisodeInfo {
  name?: string;
  slug?: string;
  [key: string]: unknown;
}

export interface ContinueWatchingProgress {
  currentEpisode: number;
  currentTime: number;
  duration: number;
  episode_info?: ContinueWatchingEpisodeInfo;
}

export interface ContinueWatchingItem {
  _id: string;
  name: string;
  slug: string;
  thumb_url?: string;
  poster_url?: string;
  /** Nested progress from the player tracker. */
  watching?: ContinueWatchingProgress;
  /** Flat progress fields from older payloads. */
  currentTime?: number;
  duration?: number;
  episodeIndex?: number;
  episodeName?: string;
  updatedAt?: number;
}

export interface WatchListItem {
  _id: string;
  name: string;
  slug: string;
  type: string;
  thumb_url?: string;
  poster_url?: string;
  year?: number;
}

export interface WatchListGroup {
  title: string;
  data: WatchListItem[];
}
