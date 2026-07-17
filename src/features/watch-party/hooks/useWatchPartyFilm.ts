import { useQuery } from '@tanstack/react-query';

import { detailsFilmService } from '@/features/film';
import type { FilmDataResponse } from '@/features/film';

export function useWatchPartyFilm(
  filmId: string | undefined,
  legacyFilmData?: Record<string, unknown>
) {
  const { data, isLoading, error } = useQuery<FilmDataResponse>({
    queryKey: ['watchParty', 'film', filmId],
    queryFn: async () => {
      const response = await detailsFilmService(filmId!);
      const payload = (response.data as { data?: FilmDataResponse })?.data ?? response.data;
      return payload as FilmDataResponse;
    },
    enabled: Boolean(filmId) && !legacyFilmData,
    staleTime: 5 * 60_000,
    retry: 2,
  });

  const filmData = (legacyFilmData ?? data) as Record<string, unknown> | undefined;

  return {
    filmData,
    isLoading: !legacyFilmData && Boolean(filmId) && isLoading,
    error: error instanceof Error ? error.message : error ? 'Không thể tải phim' : null,
  };
}

export default useWatchPartyFilm;
