'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import type { FilmCategory } from '@/features/film/types/film.types';

export interface FilmBreadcrumbProps {
  filmName?: string | undefined;
  category?: FilmCategory | undefined;
}

const FilmBreadcrumb: React.FC<FilmBreadcrumbProps> = ({ filmName, category }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-[12px] hidden detail769:block">
      <ol className="flex flex-wrap items-center gap-x-[6px] gap-y-[4px] text-[12px] text-secondary">
        <li>
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
        </li>
        {category?.slug && (
          <>
            <li aria-hidden className="opacity-50">
              <ChevronRight className="w-[12px] h-[12px]" />
            </li>
            <li>
              <Link
                href={`/the-loai/${category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            </li>
          </>
        )}
        {filmName && (
          <>
            <li aria-hidden className="opacity-50">
              <ChevronRight className="w-[12px] h-[12px]" />
            </li>
            <li className="text-primary truncate max-w-[200px]" aria-current="page">
              {filmName}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default FilmBreadcrumb;
