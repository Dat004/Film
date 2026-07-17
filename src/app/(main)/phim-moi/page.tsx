'use client';

import React from 'react';

import { CategoryFilmScreen, newFilmService } from '@/features/film';

export default function PhimMoiPage() {
  return <CategoryFilmScreen request={newFilmService} />;
}
