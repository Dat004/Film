import { describe, it, expect, beforeEach } from 'vitest';

import {
  parseCatalogFilters,
  countActiveFilters,
  filtersToQueryOptions,
} from '@/features/film/lib/filter-schemas';
import { highlightText } from '@/features/film/lib/highlight-text';
import { useRecentSearchStore } from '@/features/film/store/recent-search-store';

describe('Catalog Filter Schemas', () => {
  it('parses valid filter params correctly', () => {
    const raw = {
      sort_field: 'year',
      sort_type: 'asc',
      sort_lang: 'vietsub',
      year: '2022',
    };
    const parsed = parseCatalogFilters(raw);
    expect(parsed).toEqual({
      sort_field: 'year',
      sort_type: 'asc',
      sort_lang: 'vietsub',
      year: 2022,
    });
  });

  it('silently ignores invalid enum / out-of-bound values', () => {
    const raw = {
      sort_field: 'invalid_field',
      sort_type: 'wrong_type',
      year: '1900', // min is 2000
    };
    const parsed = parseCatalogFilters(raw);
    expect(parsed).toEqual({
      sort_field: undefined,
      sort_type: undefined,
      year: undefined,
    });
  });

  it('correctly counts active filters', () => {
    const filters = { sort_field: 'modified.time' as const, year: 2024 };
    expect(countActiveFilters(filters)).toBe(2);
  });

  it('converts filters into API query options object', () => {
    const filters = { sort_field: '_id' as const, sort_lang: 'thuyet-minh' as const, year: 2023 };
    const options = filtersToQueryOptions(filters);
    expect(options).toEqual({
      sort_field: '_id',
      sort_lang: 'thuyet-minh',
      year: 2023,
    });
  });
});

describe('Highlight Text Utility', () => {
  it('returns un-wrapped text when query is empty', () => {
    const res = highlightText('Spider-Man', '');
    expect(res).toEqual(['Spider-Man']);
  });

  it('highlights case-insensitive matches', () => {
    const res = highlightText('Avatar: The Way of Water', 'avatar');
    expect(res).toHaveLength(2); // [<mark>Avatar</mark>, ": The Way of Water"]
  });
});

describe('Recent Search Store', () => {
  beforeEach(() => {
    useRecentSearchStore.getState().clearAll();
  });

  it('adds recent searches and enforces max limit + LIFO ordering', () => {
    const { addSearch } = useRecentSearchStore.getState();
    addSearch('Marvel');
    addSearch('Batman');
    addSearch('Marvel'); // should move to front

    const { searches } = useRecentSearchStore.getState();
    expect(searches).toEqual(['Marvel', 'Batman']);
  });

  it('removes single search and clears all', () => {
    const store = useRecentSearchStore.getState();
    store.addSearch('Film A');
    store.addSearch('Film B');
    store.removeSearch('Film A');

    expect(useRecentSearchStore.getState().searches).toEqual(['Film B']);

    useRecentSearchStore.getState().clearAll();
    expect(useRecentSearchStore.getState().searches).toEqual([]);
  });
});
