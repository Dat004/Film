'use client';

import React from 'react';

import { allCategoryService } from '@/features/film';
import { useFetchData } from '@/hooks';
import { normalizeCategoryNavData } from '@/lib/api-normalize';

import LeftHeader from './LeftHeader';
import RightHeader from './RightHeader';

const Header: React.FC = () => {
  const { newData } = useFetchData({
    request: allCategoryService,
  });

  const categoryData = normalizeCategoryNavData(newData);

  return (
    <header className="fixed left-0 right-0 top-0 h-[80px] bg-bg-layout z-[500]">
      <div className="flex items-center justify-between p-[15px] mx-auto 3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl ">
        <LeftHeader dataCategory={categoryData} />
        <RightHeader />
      </div>
    </header>
  );
};

export default Header;
