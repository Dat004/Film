import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { useState, useRef, useEffect } from 'react';

import { useFetchData } from '@/hooks';

import { searchFilmService } from '../services/film.service';

export function useSearchPageFilm() {
  const [valueParams, setValueParams] = useQueryState(
    'value',
    parseAsString.withDefault('').withOptions({ shallow: false })
  );
  const [limitParams, setLimitParams] = useQueryState(
    'limit',
    parseAsInteger.withDefault(20).withOptions({ shallow: false })
  );
  const [pageParams, setPageParams] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const [searchValue, setSearchValue] = useState(valueParams);
  const {
    state: { isFetching },
    newData: data,
  } = useFetchData({
    request: searchFilmService,
    path: { keyword: valueParams, limit: limitParams, page: pageParams },
    dependencies: [valueParams, limitParams, pageParams],
    condition: !!valueParams,
  });

  const loading = isFetching;
  const searchRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef('');

  useEffect(() => {
    setSearchValue(valueParams);
  }, [valueParams]);

  useEffect(() => {
    prevValueRef.current = searchValue;
  }, [searchValue]);

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith(' ')) return;
    setSearchValue(value);
  };

  const handleClearValue = () => {
    setSearchValue('');
    if (searchRef.current) {
      searchRef.current.focus();
    }
  };

  const handleUpdateParams = (e: React.FormEvent) => {
    e.preventDefault();
    setPageParams(1);
    setValueParams(searchValue);
    setLimitParams(limitParams);
  };

  const handlePageChange = (page: number) => {
    setPageParams(page);
  };

  return {
    valueParams,
    limitParams,
    pageParams,
    searchValue,
    data,
    loading,
    searchRef,
    prevValueRef,
    handleChangeValue,
    handleClearValue,
    handleUpdateParams,
    handlePageChange,
  };
}

export default useSearchPageFilm;
