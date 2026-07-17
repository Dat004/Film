'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { cn } from '@/lib/utils';

export interface ContainerProps {
  children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  const pathname = usePathname();
  const isFilmDetailPage = pathname?.startsWith('/phim/');
  const isUserPage = pathname?.startsWith('/user');

  return (
    <main className="relative h-full min-h-[550px] pt-[80px]">
      <div
        className={cn(
          'mx-auto',
          isUserPage && 'w-full',
          isFilmDetailPage &&
            'w-full max-w-[1920px] 2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm',
          !isUserPage &&
            !isFilmDetailPage &&
            'px-[15px] 3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl'
        )}
      >
        {children}
      </div>
    </main>
  );
};

export default Container;
