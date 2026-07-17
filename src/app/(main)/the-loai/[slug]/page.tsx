'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import { CategoryFilmScreen } from '@/features/film';
import { categoryFilmService } from '@/features/film';

export default function TheLoaiPage() {
  const params = useParams();
  const slug = (params?.slug as string | undefined) || '';

  return <CategoryFilmScreen request={categoryFilmService} slug={slug} />;
}
