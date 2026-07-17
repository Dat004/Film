'use client';

import React, { useState, useEffect } from 'react';

import Button from '@/components/ui/Button';

export interface PreviousPageProps {
  activeIndex?: number;
  countsPrev?: number;
  startIndex?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const PreviousPage: React.FC<PreviousPageProps> = ({
  activeIndex = 0,
  countsPrev = 0,
  startIndex = 0,
  ...props
}) => {
  const [arrCountsPrev, setArrCountsPrev] = useState<number[]>([]);

  useEffect(() => {
    let startPrevIndex = activeIndex - countsPrev;
    let totalCountsPrevArray = [];

    for (let i = startPrevIndex; i < activeIndex; i++) {
      totalCountsPrevArray.push(i);
    }

    setArrCountsPrev(totalCountsPrevArray.filter((items) => items > startIndex));
  }, [activeIndex, countsPrev, startIndex]);

  return (
    <>
      {arrCountsPrev.map((items, index) => (
        <Button
          key={index}
          data-index={items}
          aria-label={items.toString()}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
          {...props}
        >
          {items}
        </Button>
      ))}
    </>
  );
};

export default PreviousPage;
