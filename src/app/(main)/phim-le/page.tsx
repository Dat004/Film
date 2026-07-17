'use client';

import React from 'react';

import { CategoryFilmScreen } from '@/features/film';
import { singleFilmService } from '@/features/film';

export default function PhimLePage() {
  return <CategoryFilmScreen request={singleFilmService} />;
}
