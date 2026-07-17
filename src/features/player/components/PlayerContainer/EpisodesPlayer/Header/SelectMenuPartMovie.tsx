'use client';

import React from 'react';

import Button from '@/components/ui/Button';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/Popover';

export interface SelectMenuPartMovieProps {
  dataMenuSelect?: Array<Array<{ slug?: string }>>;
  currentPartMovie?: number;
  isShowMenu?: boolean;
  handleSelect?: (index: number) => void;
}

const SelectMenuPartMovie: React.FC<SelectMenuPartMovieProps> = ({
  dataMenuSelect = [],
  currentPartMovie = 0,
  isShowMenu = false,
  handleSelect = () => {},
}) => {
  return (
    <Popover open={isShowMenu} modal={false}>
      <PopoverAnchor className="absolute left-0 top-[calc(100%+25%)] w-[100%]" />
      {isShowMenu && (
        <PopoverContent
          className="w-[100%] max-h-[150px] rounded-l-[8px] py-[5px] bg-bg-layout border-bd-filed-form-color p-0 overflow-auto"
          sideOffset={0}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {dataMenuSelect?.map((items, index) => (
            <Button
              key={index}
              className={`w-[100%] h-[100%] !justify-start hover:!text-primary ${
                index !== currentPartMovie
                  ? 'text-title hover:bg-bg-odd-color'
                  : 'text-primary bg-bg-select-color'
              } p-[8px] text-[12px] font-medium`}
              data-index={index}
              onClick={() => handleSelect(index)}
            >
              <span>EPS:</span>
              {items[0]?.slug?.split('-')[1] || items[items?.length - 1]?.slug?.split('-')[1] ? (
                <>
                  <span className="ml-[4px]">{items[0]?.slug?.split('-')[1]}</span>
                  <span>-</span>
                  <span>{items[items?.length - 1]?.slug?.split('-')[1]}</span>
                </>
              ) : (
                <span className="ml-[4px] capitalize">{items[0]?.slug}</span>
              )}
            </Button>
          ))}
        </PopoverContent>
      )}
    </Popover>
  );
};

export default SelectMenuPartMovie;
