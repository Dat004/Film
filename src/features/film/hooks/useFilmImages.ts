'use client';

import { useQuery } from '@tanstack/react-query';

import { extractFilmImages } from '@/lib/film-detail-extras';

import { filmImagesService } from '../services/film.service';

export function useFilmImages(slug?: string) {
  const enabled = Boolean(slug);

  const imagesQuery = useQuery({
    queryKey: ['film-images', slug],
    queryFn: () => filmImagesService(slug!),
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  const images = extractFilmImages(imagesQuery.data);

  return {
    images,
    isLoading: imagesQuery.isLoading,
    isError: imagesQuery.isError,
  };
}
