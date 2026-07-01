import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { filmService } from "../services/film-service";

export function useAllFilms() {
  return useQuery({
    queryKey: ["films", "all"],
    queryFn: () => filmService.allDataService(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => filmService.allCategoryService(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours caching
  });
}

export function useFilmDetail(slug: string) {
  return useQuery({
    queryKey: ["film", "detail", slug],
    queryFn: () => filmService.detailsFilmService(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchFilms(keyword: string, limit = 10) {
  return useQuery({
    queryKey: ["films", "search", keyword, limit],
    queryFn: () => filmService.searchFilmService(keyword, limit),
    enabled: !!keyword,
  });
}

export function useNewFilms(page = 1) {
  return useQuery({
    queryKey: ["films", "new", page],
    queryFn: () => filmService.newFilmService(page),
    placeholderData: keepPreviousData,
  });
}

export function useSingleFilms(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["films", "single", page, limit],
    queryFn: () => filmService.singleFilmService(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useSeriesFilms(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["films", "series", page, limit],
    queryFn: () => filmService.seriesFilmService(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useCartoonFilms(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["films", "cartoon", page, limit],
    queryFn: () => filmService.cartoonService(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useTvShowFilms(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["films", "tvshow", page, limit],
    queryFn: () => filmService.tvShowService(page, limit),
    placeholderData: keepPreviousData,
  });
}

export function useCountryFilms(slug: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["films", "country", slug, page, limit],
    queryFn: () => filmService.countryFilmService(slug, page, limit),
    enabled: !!slug,
    placeholderData: keepPreviousData,
  });
}

export function useCategoryFilms(slug: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["films", "category", slug, page, limit],
    queryFn: () => filmService.categoryFilmService(slug, page, limit),
    enabled: !!slug,
    placeholderData: keepPreviousData,
  });
}
