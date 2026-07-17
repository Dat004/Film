'use client';

import { Search, X } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import SearchPageSkeleton from '@/components/ui/SearchPageSkeleton';

import { useSearchPageFilm } from '../../hooks/useSearchPageFilm';

import SearchResultsFilm from './SearchResultsFilm';

const SearchPageFilmScreenContent: React.FC = () => {
  const {
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
  } = useSearchPageFilm();

  return (
    <>
      <div>
        <form className="pb-[42px]" onSubmit={handleUpdateParams}>
          <FlexContainer className="items-center py-[8px] bg-search-form rounded-[4px] px-[15px] clm:px-[12px] border border-solid border-bd-filed-form-color">
            <FlexItems className=" flex-grow !flex-shrink">
              <FlexContainer className="relative items-center">
                <FlexItems className="!flex-grow-0">
                  <i className="text-primary text-[20px]">
                    <Search />
                  </i>
                </FlexItems>
                <FlexItems className="w-[100%] !flex-shrink">
                  <div className="clm:px-[12px] px-[15px]">
                    <input
                      type="text"
                      name="search"
                      ref={searchRef}
                      value={searchValue}
                      autoComplete="off"
                      onChange={handleChangeValue}
                      className="w-[100%] text-[14px] text-primary"
                      placeholder="Nhập tên phim, kênh, sự kiện..."
                    />
                  </div>
                </FlexItems>
                {searchValue && (
                  <FlexItems className="flex-grow-0">
                    <Button onClick={handleClearValue} type="button">
                      <i>
                        <X />
                      </i>
                    </Button>
                  </FlexItems>
                )}
              </FlexContainer>
            </FlexItems>
            <FlexItems className="ml-[15px] clm:ml-[12px] !flex-grow-0 !flex-shrink-0">
              <Button
                aria-label="search-btn"
                type="submit"
                className="bg-bg-search-btn !text-primary text-[14px] px-[24px] kdm:px-[16px] kdm:py-[8px] rounded-[4px] py-[10px]"
                disabled={!searchValue || !(prevValueRef.current !== searchValue)}
              >
                Tìm kiếm
              </Button>
            </FlexItems>
          </FlexContainer>
        </form>
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
