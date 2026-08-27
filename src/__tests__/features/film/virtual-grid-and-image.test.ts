import { describe, it, expect } from 'vitest';

import type { Film } from '@/features/film/types/film.types';

describe('Virtual Film Grid Row Calculation', () => {
  const dummyFilms: Partial<Film>[] = Array.from({ length: 10 }, (_, i) => ({
    _id: `film-${i}`,
    name: `Film ${i}`,
    slug: `film-${i}`,
  }));

  it('chunks items into rows based on column count of 3', () => {
    const columns = 3;
    const rows: Partial<Film>[][] = [];
    for (let i = 0; i < dummyFilms.length; i += columns) {
      rows.push(dummyFilms.slice(i, i + columns));
    }

    expect(rows.length).toBe(4); // Math.ceil(10 / 3) = 4
    expect(rows[0]?.length).toBe(3);
    expect(rows[3]?.length).toBe(1);
  });

  it('chunks items correctly for mobile single column layout', () => {
    const columns = 1;
    const rows: Partial<Film>[][] = [];
    for (let i = 0; i < dummyFilms.length; i += columns) {
      rows.push(dummyFilms.slice(i, i + columns));
    }

    expect(rows.length).toBe(10);
    expect(rows[0]?.[0]?.name).toBe('Film 0');
  });
});
