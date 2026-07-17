'use client';

import { ChevronRight } from 'lucide-react';
import React from 'react';

import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './Popover';

export interface SubmenuItem {
  title: string;
  isSubMenu?: boolean;
  subMenu?: SubmenuItem[];
  [key: string]: unknown;
}

export interface SubmenuProps extends React.HTMLAttributes<HTMLDivElement> {
  dataMenu?: SubmenuItem[];
  className?: string;
}

const Submenu: React.FC<SubmenuProps> = ({ dataMenu = [], className, ...passProps }) => {
  const menuClasses = cn('!bg-bg-white max-w-[220px] !rounded-[2px] min-w-[140px]', {
    [className || '']: className,
  });

  return (
    <Container className={menuClasses} {...passProps}>
      <ul>
        {dataMenu.map((item, index) => (
          <li
            key={index}
            className="relative w-[100%] h-[36px] bg-transparent hover:bg-bg-menu-items leading-[1] select-none cursor-pointer"
          >
            {item.isSubMenu && item.subMenu ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full h-full text-left">
                    <p className="flex px-[12px] py-[10px] items-center">
                      <span className="text-[12px] text-dark font-medium">{item.title}</span>
                      <i className="ml-auto flex items-center justify-center">
                        <ChevronRight />
                      </i>
                    </p>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  className="p-0 border-bd-filed-form-color"
                >
                  <Submenu dataMenu={item.subMenu} />
                </PopoverContent>
              </Popover>
            ) : (
              <p className="flex px-[12px] py-[10px] items-center">
                <span className="text-[12px] text-dark font-medium">{item.title}</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </Container>
  );
};

export default Submenu;
