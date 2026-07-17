'use client';

import React from 'react';

import { CategoryFilmScreen } from '@/features/film';
import { tvShowService } from '@/features/film';

export default function TVShowsPage() {
  return <CategoryFilmScreen request={tvShowService} />;
}
