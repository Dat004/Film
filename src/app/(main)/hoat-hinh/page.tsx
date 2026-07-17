'use client';

import { CategoryFilmScreen } from '@/features/film';
import { cartoonService } from '@/features/film';

export default function HoatHinhPage() {
  return <CategoryFilmScreen request={cartoonService} />;
}
