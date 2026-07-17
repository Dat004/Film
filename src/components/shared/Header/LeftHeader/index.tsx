'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import images from '@/assets/images';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import Image from '@/components/ui/Image';
import data from '@/constants';
import { BarMenuIcon } from '@/icons';
import { normalizeCategoryNavData } from '@/lib/api-normalize';

import BarMenu from './BarMenu';

export interface LeftHeaderProps {
  dataCategory?: unknown;
}

const LeftHeader: React.FC<LeftHeaderProps> = ({ dataCategory }) => {
  const [isShowMenu, setIsShowMenu] = useState(false);
  const pathname = usePathname();

  const [categories, countries] = normalizeCategoryNavData(dataCategory);
  const hasCategoryNav = categories.length > 0 || countries.length > 0;

  return (
    <>
      <BarMenu
        dataCategory={[categories, countries]}
        isOpen={isShowMenu}
        onOpenChange={setIsShowMenu}
      />
      <div className="flex items-center">
        <Button
          aria-expanded={isShowMenu}
          aria-haspopup="menu"
          onClick={() => setIsShowMenu(true)}
          className="hidden lgm:block mr-[15px]"
        >
          <BarMenuIcon width="24px" height="24px" />
        </Button>
        <Link className="mr-[25px]" href="/">
          <div>
            <Image
              className="!w-[125px] !h-auto"
              src={(images.logo as any).src || images.logo}
              alt="logo"
            />
          </div>
        </Link>
        <nav className="flex items-center lgm:hidden">
          {data.dataMenu.map((items: any, index: number) => (
            <Link
              className={`${
                pathname === items.path ? 'text-primary' : 'text-secondary'
              } p-[12px] hover:text-primary cursor-pointer`}
              aria-label={items.title}
              href={items.path}
              key={index}
            >
              <span className="text-[16px] font-medium">{items.title}</span>
            </Link>
          ))}
          {hasCategoryNav && (
            <ul className="flex items-center">
              {categories.length > 0 && (
                <li
                  className={`${
                    pathname?.split('/')[1] === 'the-loai' ? 'text-primary' : 'text-secondary'
                  } relative group/table p-[12px] flex items-center hover:text-primary cursor-pointer`}
                >
                  <span className="text-[16px] font-medium">Thể loại</span>
                  <div className="hidden group-hover/table:block absolute left-0 xlm:left-[calc(0%-50px)] top-[100%] cursor-default">
                    <Container className="w-[540px] xlm:w-[350px] p-[12px] max-h-[450px]">
                      <FlexContainer className="!gap-y-0" isWrap>
                        {categories.map((item: any) => (
                          <FlexItems
                            className="separator-item flex-shrink-0 w-[25%] xlm:w-[calc(100%/3)]"
                            key={item?._id}
                          >
                            <p className="text-[14px] font-normal">
                              <Link
                                className="text-secondary hover:text-primary px-[12px] w-[100%] block"
                                href={`/the-loai/${item?.slug}`}
                              >
                                {item?.name}
                              </Link>
                            </p>
                          </FlexItems>
                        ))}
                      </FlexContainer>
                    </Container>
                  </div>
                </li>
              )}
              {countries.length > 0 && (
                <li
                  className={`${
                    pathname?.split('/')[1] === 'quoc-gia' ? 'text-primary' : 'text-secondary'
                  } relative group/table p-[12px] flex items-center hover:text-primary cursor-pointer`}
                >
                  <span className="text-[16px] font-medium">Quốc gia</span>
                  <div className="hidden group-hover/table:block absolute left-[calc(0%-81px)] xlm:left-[calc(-20%-114px)] top-[100%] cursor-default">
                    <Container className="w-[540px] xlm:w-[350px] p-[12px] max-h-[450px] overflow-auto">
                      <FlexContainer className="!gap-y-0" isWrap>
                        {countries.map((item: any) => (
                          <FlexItems
                            className="separator-item flex-shrink-0 w-[25%] xlm:w-[calc(100%/3)]"
                            key={item?._id}
                          >
                            <p className="text-[14px] font-normal">
                              <Link
                                className="text-secondary hover:text-primary px-[12px] w-[100%] block"
                                href={`/quoc-gia/${item?.slug}`}
                              >
                                {item?.name}
                              </Link>
                            </p>
                          </FlexItems>
                        ))}
                      </FlexContainer>
                    </Container>
                  </div>
                </li>
              )}
            </ul>
          )}
        </nav>
      </div>
    </>
  );
};

export default LeftHeader;
