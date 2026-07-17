'use client';

import Link from 'next/link';
import React from 'react';

import type { FilmCategory, FilmCountry } from '../types/film.types';

export interface FilmTagLinksProps {
  categories?: FilmCategory[] | undefined;
  countries?: FilmCountry[] | undefined;
}

const badgeClass =
  'rounded-[6px] border border-bd-filed-form-color bg-bg-field px-[8px] py-[3px] text-[11px] font-medium text-primary uppercase tracking-wide transition-colors hover:border-hover hover:text-hover';

const FilmTagLinks: React.FC<FilmTagLinksProps> = ({ categories = [], countries = [] }) => {
  if (categories.length === 0 && countries.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-[6px]">
      {categories.map((cat) => (
        <Link key={cat.slug || cat.id} href={`/the-loai/${cat.slug}`} className={badgeClass}>
          {cat.name}
        </Link>
      ))}
      {countries.map((c) => (
        <Link key={c.slug || c.id} href={`/quoc-gia/${c.slug}`} className={badgeClass}>
          {c.name}
        </Link>
      ))}
    </div>
  );
};

export default FilmTagLinks;
