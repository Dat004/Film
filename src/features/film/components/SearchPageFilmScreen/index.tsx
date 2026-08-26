'use client';

import React from 'react';

import SearchPageSkeleton from '@/components/ui/SearchPageSkeleton';

import { useSearchPageFilm } from '../../hooks/useSearchPageFilm';

import SearchAutocomplete from './SearchAutocomplete';
import SearchResultsFilm from './SearchResultsFilm';

const SearchPageFilmScreenContent: React.FC = () => {
  const {
    limitParams,
    pageParams,
    searchValue,
    setSearchValue,
    setValueParams,
    setPageParams,
    data,
    loading,
    handlePageChange,
  } = useSearchPageFilm();

  const handleSubmitKeyword = (keyword: string) => {
    setPageParams(1);
    setValueParams(keyword);
  };

  return (
    <>
      <div className="pb-[32px]">
        <SearchAutocomplete
          value={searchValue}
          onChange={setSearchValue}
          onSubmit={handleSubmitKeyword}
          placeholder="Nhập tên phim, diễn viên, từ khóa..."
        />
      </div>
      {!loading && !!data && (
        <SearchResultsFilm
          data={data}
          limit={limitParams}
          currentPage={pageParams}
          onPageChange={handlePageChange}
        />
      )}
      {loading && !data && (
        <div className="min-w-[calc(100dvh-90px)] mask-loading">
          <SearchPageSkeleton />
        </div>
      )}
    </>
  );
};

export const SearchPageFilmScreen: React.FC<any> = (props) => {
  return (
    <React.Suspense
      fallback={
        <div className="min-w-[calc(100dvh-90px)] mask-loading">
          <SearchPageSkeleton />
        </div>
      }
    >
      <SearchPageFilmScreenContent {...props} />
    </React.Suspense>
  );
};

export default SearchPageFilmScreen;
