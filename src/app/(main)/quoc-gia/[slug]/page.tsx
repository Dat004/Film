'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import { CategoryFilmScreen } from '@/features/film';
import { countryFilmService } from '@/features/film';

export default function QuocGiaPage() {
  const params = useParams();
  const slug = (params?.slug as string | undefined) || '';

  return <CategoryFilmScreen request={countryFilmService} slug={slug} />;
}
