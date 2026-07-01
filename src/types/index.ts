// Shared TypeScript Type Definitions for Film Web App

export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface FilmItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  [key: string]: any;
}

export interface FilmListResponse {
  status: string;
  message?: string;
  data: {
    seoOnPage?: any;
    breadCrumb?: any[];
    titlePage?: string;
    items: FilmItem[];
    params: {
      type_list: string;
      slug: string;
      filterCategory: string[];
      filterCountry: string[];
      filterYear: string;
      filterType: string;
      sortField: string;
      sortType: string;
      pagination: Pagination;
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface FilmDetailResponse {
  status: string;
  msg?: string;
  movie: {
    _id: string;
    name: string;
    origin_name: string;
    content: string;
    type: string;
    status: string;
    thumb_url: string;
    poster_url: string;
    is_copyright: boolean;
    sub_docquyen: boolean;
    chieurap: boolean;
    trailer_url: string;
    time: string;
    episode_current: string;
    episode_total: string;
    quality: string;
    lang: string;
    notify: string;
    showtimes: string;
    slug: string;
    year: number;
    view: number;
    actor: string[];
    director: string[];
    category: Array<{ id: string; name: string; slug: string }>;
    country: Array<{ id: string; name: string; slug: string }>;
  };
  episodes: Array<{
    server_name: string;
    server_data: Array<{
      name: string;
      slug: string;
      filename: string;
      link_redirection: string;
      link_m3u8: string;
    }>;
  }>;
}

export interface UserInfo {
  uid: string;
  displayName: string;
  photoUrl: string;
  email: string;
  phoneNumber?: string;
  [key: string]: any;
}

export interface ContinueWatchingItem {
  _id: string;
  name: string;
  slug: string;
  currentTime: number;
  duration: number;
  episodeIndex: number;
  episodeName: string;
  updatedAt: number;
  [key: string]: any;
}

export interface WatchListItem {
  _id: string;
  name: string;
  slug: string;
  type: string;
  [key: string]: any;
}

export interface WatchListGroup {
  title: string;
  data: WatchListItem[];
}
