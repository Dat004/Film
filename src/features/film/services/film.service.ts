import type { AxiosResponse } from 'axios';

import { extractListItems } from '@/lib/api-normalize';
import { getRequest, getAllRequest } from '@/services/api-client';

import { buildBannerDataPayload } from '../lib/banner-films';

export interface FilmQueryOptions {
  page?: number;
  limit?: number;
}

export interface CountryFilmQueryOptions extends FilmQueryOptions {
  slug?: string;
}

export interface CategoryFilmQueryOptions extends FilmQueryOptions {
  slug?: string;
}

export type DanhSachV1Type = 'phim-le' | 'phim-bo' | 'hoat-hinh' | 'tv-shows';

export interface DanhSachV1QueryOptions extends FilmQueryOptions {
  category?: string;
  country?: string;
  year?: number | string;
  sort_field?: 'modified.time' | '_id' | 'year';
  sort_type?: 'desc' | 'asc';
  sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
}

function buildDanhSachParams({
  page = 1,
  limit = 20,
  category,
  country,
  year,
  sort_field = 'modified.time',
  sort_type = 'desc',
  sort_lang,
}: DanhSachV1QueryOptions = {}): Record<string, string | number> {
  const params: Record<string, string | number> = { page, limit, sort_field, sort_type };
  if (category) params.category = category;
  if (country) params.country = country;
  if (year !== undefined && year !== '') params.year = year;
  if (sort_lang) params.sort_lang = sort_lang;
  return params;
}

export const allDataService = async (): Promise<unknown[]> => {
  const paths = [
    'v1/api/danh-sach',
    'v1/api/danh-sach/phim-le',
    'v1/api/danh-sach/phim-bo',
    'v1/api/danh-sach/hoat-hinh',
    'v1/api/danh-sach/tv-shows',
  ];
  return getAllRequest(paths);
};

export const allCategoryService = async (): Promise<unknown[][]> => {
  const paths = ['the-loai', 'quoc-gia'];
  const responses = await getAllRequest(paths);
  return responses.map(extractListItems);
};

export const detailsFilmService = async (slugFilm: string): Promise<AxiosResponse> => {
  return getRequest(`phim/${slugFilm}`);
};

export const filmPeoplesService = async (slug: string): Promise<unknown> => {
  const response = await getRequest(`v1/api/phim/${slug}/peoples`);
  return response.data;
};

export const filmKeywordsService = async (slug: string): Promise<unknown> => {
  const response = await getRequest(`v1/api/phim/${slug}/keywords`);
  return response.data;
};

export const filmImagesService = async (slug: string): Promise<unknown> => {
  const response = await getRequest(`v1/api/phim/${slug}/images`);
  return response.data;
};

export const searchFilmService = async ({
  keyword,
  limit = 10,
  page = 1,
}: {
  keyword: string;
  limit?: number;
  page?: number;
}): Promise<AxiosResponse> => {
  return getRequest('v1/api/tim-kiem', {
    params: { keyword, limit, page },
  });
};

/** Fetches v1 catalog and filtered lists. */
export const danhSachService = async (
  _: unknown = undefined,
  options: DanhSachV1QueryOptions = {}
): Promise<AxiosResponse> => {
  return getRequest('v1/api/danh-sach', { params: buildDanhSachParams(options) });
};

export const newFilmService = async (
  _: unknown,
  options: DanhSachV1QueryOptions = {}
): Promise<AxiosResponse> => {
  return danhSachService(_, options);
};

export const singleFilmService = async (
  _: unknown,
  { page = 1, limit = 20 }: FilmQueryOptions = {}
): Promise<AxiosResponse> => {
  return getRequest('v1/api/danh-sach/phim-le', { params: { page, limit } });
};

export const seriesFilmService = async (
  _: unknown,
  { page = 1, limit = 20 }: FilmQueryOptions = {}
): Promise<AxiosResponse> => {
  return getRequest('v1/api/danh-sach/phim-bo', { params: { page, limit } });
};

export const cartoonService = async (
  _: unknown,
  { page = 1, limit = 20 }: FilmQueryOptions = {}
): Promise<AxiosResponse> => {
  return getRequest('v1/api/danh-sach/hoat-hinh', { params: { page, limit } });
};

export const tvShowService = async (
  _: unknown,
  { page = 1, limit = 20 }: FilmQueryOptions = {}
): Promise<AxiosResponse> => {
  return getRequest('v1/api/danh-sach/tv-shows', { params: { page, limit } });
};

/** Fetches a curated v1 list with catalog filters. */
export const danhSachV1Service = async (
  type: DanhSachV1Type,
  options: DanhSachV1QueryOptions = {}
): Promise<AxiosResponse> => {
  return getRequest(`v1/api/danh-sach/${type}`, { params: buildDanhSachParams(options) });
};

/** Fetches films filtered by category. */
export const categoryFilmService = async (
  _: unknown,
  { slug = 'hanh-dong', page = 1, limit = 20 }: CategoryFilmQueryOptions = {}
): Promise<AxiosResponse> => {
  return danhSachV1Service('phim-bo', {
    page,
    limit,
    category: slug,
    sort_field: 'modified.time',
    sort_type: 'desc',
  });
};

/** Fetches films filtered by country. */
export const countryFilmService = async (
  _: unknown,
  { slug = 'viet-nam', page = 1, limit = 20 }: CountryFilmQueryOptions = {}
): Promise<AxiosResponse> => {
  return danhSachV1Service('phim-le', {
    page,
    limit,
    country: slug,
    sort_field: 'modified.time',
    sort_type: 'desc',
  });
};

/** Home banner — cùng nguồn với trang Phim mới (`v1/api/danh-sach`). */
export async function fetchHomeBannerData() {
  try {
    const response = await danhSachService(undefined, {
      page: 1,
      limit: 24,
      sort_field: 'modified.time',
      sort_type: 'desc',
    });
    const root = response.data as { data?: Record<string, unknown> };
    const payload = root?.data ?? (response.data as Record<string, unknown>);
    return buildBannerDataPayload(payload);
  } catch {
    return { itemsBanner: null };
  }
}
