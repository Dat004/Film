'use client';

import React from 'react';

import { CategoryFilmScreen } from '@/features/film';
import { seriesFilmService } from '@/features/film';

export default function PhimBoPage() {
  return <CategoryFilmScreen request={seriesFilmService} />;
}
