'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';

import FlexContainer from './FlexContainer';
import FlexItems from './FlexItems';
import NextPage from './NextPage';
import PreviousPage from './PreviousPage';

export interface CustomPaginationProps {
  startIndex?: number;
  endIndex?: number;
  activeIndex?: number;
  countsNext?: number;
  countsPrev?: number;
  onIndex?: (index: number) => void;
  onNextIndex?: () => void;
  onPrevIndex?: () => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  startIndex = 0,
  endIndex = 0,
  activeIndex = 0,
  countsNext = 2,
  countsPrev = 2,
  onIndex = () => {},
  onNextIndex = () => {},
  onPrevIndex = () => {},
}) => {
  const [isMediumMobile, setIsMediumMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  const countPrevInMobile = isSmallMobile ? 0 : isMediumMobile ? 1 : countsPrev;
  const countNextInMobile = isSmallMobile ? 0 : isMediumMobile ? 1 : countsNext;

  useEffect(() => {
    const handleResize = () => {
      const isMediumMobileActive = window.matchMedia('only screen and (max-width: 710px)').matches;
      const isSmallMobileActive = window.matchMedia('only screen and (max-width: 480px)').matches;

      setIsSmallMobile(isSmallMobileActive);
      setIsMediumMobile(isMediumMobileActive);
    };

    handleResize(); // initial check on mount
    window.addEventListener('resize', handleResize, {
      passive: true,
    });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleChangeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const index = +(target.dataset.index || 0);
    onIndex(index);
  };

  return (
    <FlexContainer className="mt-[40px] gap-x-[6px] justify-center">
      <FlexItems>
        <Button
          onClick={onPrevIndex}
          disabled={activeIndex <= startIndex}
          aria-label="prev-btn"
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          <i className="text-[18px]">
            <ChevronLeft />
          </i>
        </Button>
      </FlexItems>
      {activeIndex !== startIndex && (
        <FlexItems>
          <Button
            onClick={handleChangeIndex}
            className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
            aria-label={startIndex.toString()}
            data-index={startIndex}
            outline
          >
            {startIndex}
          </Button>
        </FlexItems>
      )}
      {activeIndex > startIndex + countPrevInMobile + 1 && (
        <FlexItems>
          <div className="text-center leading-[1.65] p-[4px] min-w-[35px] h-[35px] justify-center text-primary select-none flex items-center">
            <span>&hellip;</span>
          </div>
        </FlexItems>
      )}
      <PreviousPage
        activeIndex={activeIndex}
        countsPrev={countPrevInMobile}
        startIndex={startIndex}
        onClick={handleChangeIndex}
      />
      <FlexItems>
        <Button
          onClick={handleChangeIndex}
          aria-label={activeIndex.toString()}
          data-index={activeIndex}
          className="pagination-page-active border-bd-btn-pagination-color hover:bg-bg-btn-hover-active-pagination hover:!text-primary text-[14px] bg-bg-btn-active-pagination p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          {activeIndex}
        </Button>
      </FlexItems>
      <NextPage
        activeIndex={activeIndex}
        countsNext={countNextInMobile}
        endIndex={endIndex}
        onClick={handleChangeIndex}
      />
      {activeIndex < endIndex - countNextInMobile - 1 && (
        <FlexItems>
          <div className="text-center leading-[1.65] p-[4px] min-w-[35px] h-[35px] justify-center text-primary select-none flex items-center">
            <span>&hellip;</span>
          </div>
        </FlexItems>
      )}
      {activeIndex !== endIndex && (
        <FlexItems>
          <Button
            onClick={handleChangeIndex}
            aria-label={endIndex.toString()}
            data-index={endIndex}
            className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
            outline
          >
            {endIndex}
          </Button>
        </FlexItems>
      )}
      <FlexItems>
        <Button
          onClick={onNextIndex}
          aria-label="next-btn"
          disabled={activeIndex >= endIndex}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          <i className="text-[18px]">
            <ChevronRight />
          </i>
        </Button>
      </FlexItems>
    </FlexContainer>
  );
};

export default CustomPagination;
