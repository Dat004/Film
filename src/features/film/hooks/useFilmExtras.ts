'use client';

import { useQuery } from '@tanstack/react-query';

import {
  extractFilmPeoples,
  extractFilmKeywords,
  extractFilmBackdrops,
  extractFilmImages,
} from '@/lib/film-detail-extras';

import {
  filmPeoplesService,
  filmKeywordsService,
  filmImagesService,
} from '../services/film.service';

export function useFilmExtras(slug?: string) {
  const enabled = Boolean(slug);

  const peoplesQuery = useQuery({
    queryKey: ['film-peoples', slug],
    queryFn: () => filmPeoplesService(slug!),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  const keywordsQuery = useQuery({
    queryKey: ['film-keywords', slug],
    queryFn: () => filmKeywordsService(slug!),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  const imagesQuery = useQuery({
    queryKey: ['film-images', slug],
    queryFn: () => filmImagesService(slug!),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  const peoplesPayload = peoplesQuery.data;
  const profileSizes =
    peoplesPayload &&
    typeof peoplesPayload === 'object' &&
    'data' in peoplesPayload &&
    peoplesPayload.data &&
    typeof peoplesPayload.data === 'object' &&
    'profile_sizes' in (peoplesPayload.data as object)
      ? ((peoplesPayload.data as { profile_sizes?: Record<string, string> }).profile_sizes ?? {})
      : {};

  return {
    peoples: extractFilmPeoples(peoplesQuery.data),
    keywords: extractFilmKeywords(keywordsQuery.data),
    backdrops: extractFilmBackdrops(imagesQuery.data),
    images: extractFilmImages(imagesQuery.data),
    profileSizes,
    isPeoplesLoading: peoplesQuery.isLoading,
    isKeywordsLoading: keywordsQuery.isLoading,
    isImagesLoading: imagesQuery.isLoading,
  };
}
