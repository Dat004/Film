'use client';

import Link from 'next/link';
import React from 'react';

import CustomPagination from '@/components/ui/CustomPagination';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';

import FilmElement from '../FilmElement';

export interface SearchResultsFilmProps {
  data?: any;
  limit?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const SearchResultsFilm: React.FC<SearchResultsFilmProps> = ({
  data = {},
  limit = 20,
  currentPage: currentPageProp = 1,
  onPageChange,
}) => {
  const { APP_DOMAIN_CDN_IMAGE, items, params, seoOnPage } = data;
  const pagination = params?.pagination || {};
  const currentPage = pagination.currentPage || currentPageProp;
  const totalPages = pagination.totalPages || 1;

  const keywordsSuggest = seoOnPage?.titleHead?.split(' | ');

  return (
    <>
      {!!items?.length ? (
        <>
          <FlexContainer className="w-[100%] !gap-y-0 flex-row 2xlm:flex-col">
            <FlexItems className="!flex-grow-0 2xlm:w-[100%] w-[25%] 2xlm:ml-0 ml-[20px] !flex-shrink-0 order-2 2xlm:order-1">
              <FlexContainer className="flex-wrap items-center !gap-y-[15px] mb-[20px]">
                <FlexItems className="mr-[15px]">
                  <span className="text-[14px] text-primary">Từ khóa liên quan:</span>
                </FlexItems>
                {keywordsSuggest?.map((item: string, index: number) => (
                  <FlexItems key={index} className="mr-[8px]">
                    <Link
                      aria-label={item}
                      href={`/search?value=${item}&limit=${limit}`}
                      className="px-[16px] py-[6px] rounded-[999px] bg-bg-multiport text-[14px] text-primary hover:text-hover"
                    >
                      {item}
                    </Link>
                  </FlexItems>
                ))}
              </FlexContainer>
            </FlexItems>
            <FlexItems className="flex-grow 2xlm:w-[100%] w-[75%] !flex-shrink order-1 2xlm:order-2">
              <FlexContainer className="mx-[-12px] pb-[24px] items-start" isWrap>
                {items?.map((item: any) => (
                  <FlexItems
                    // Breakpoints project: *m = max-width. Desktop-first: 3 → 2 → 1
                    className="player3col:w-[calc(100%/2)] 2xlm:w-[calc(100%/3)] xlm:w-[calc(100%/2)] ssm:w-[100%] px-[12px]"
                    key={item?._id}
                  >
                    <FilmElement data={item} baseUrl={APP_DOMAIN_CDN_IMAGE} />
                  </FlexItems>
                ))}
              </FlexContainer>
            </FlexItems>
          </FlexContainer>
          <CustomPagination
            startIndex={1}
            activeIndex={currentPage}
            endIndex={totalPages}
            onIndex={(page) => onPageChange?.(page)}
            onPrevIndex={() => onPageChange?.(Math.max(1, currentPage - 1))}
            onNextIndex={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          />
        </>
      ) : (
        <div className="mt-[30px] select-none pointer-events-none">
          <div className="relative h-[180px]">
            <h1 className="notification-title">404</h1>
            <h2 className="notification-content">Page not result</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchResultsFilm;
