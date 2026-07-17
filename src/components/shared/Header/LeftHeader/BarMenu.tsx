'use client';

import { ChevronDown, ChevronUp, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/Dialog';
import router from '@/constants/routes';
import { normalizeCategoryNavData } from '@/lib/api-normalize';

type MenuLinkItem = { type: string; slug?: string | undefined; name?: string | undefined };

export interface BarMenuProps {
  dataCategory?: unknown;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BarMenu: React.FC<BarMenuProps> = ({
  dataCategory,
  isOpen = false,
  onOpenChange = () => {},
}) => {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [categories, countries] = normalizeCategoryNavData(dataCategory);

  const categoriesFilm: MenuLinkItem[] = categories.map((item) => ({
    type: 'link',
    slug: item.slug,
    name: item.name,
  }));

  const countriesCategoryFilm: MenuLinkItem[] = countries.map((item) => ({
    type: 'link',
    slug: item.slug,
    name: item.name,
  }));

  const navItems = [
    { name: 'Trang chủ', slug: router.home, type: 'link' },
    { name: 'Phim mới', slug: router.phim_moi, type: 'link' },
    { name: 'Phim lẻ', slug: router.phim_le, type: 'link' },
    { name: 'Phim bộ', slug: router.phim_bo, type: 'link' },
    { name: 'Phim hoạt hình', slug: router.phim_hoat_hinh, type: 'link' },
    { name: 'TV Show', slug: router.tv_show, type: 'link' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        hideTitle
        position="drawer-left"
        title="Menu điều hướng"
        description="Menu điều hướng chính của trang web"
        className="left-0 top-0 h-[100dvh] w-[250px] max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-bg-sidebar p-0 shadow-xl data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left duration-300"
      >
        <DialogTitle className="sr-only">Menu điều hướng</DialogTitle>
        <DialogDescription className="sr-only">
          Menu điều hướng chính của trang web
        </DialogDescription>

        <div className="flex items-center justify-end p-[12px]">
          <DialogClose asChild>
            <Button rounded aria-label="Đóng menu">
              <X className="text-[18px]" />
            </Button>
          </DialogClose>
        </div>

        <nav>
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.slug}
                  onClick={() => onOpenChange(false)}
                  className={`flex items-center px-[16px] w-[100%] h-[40px] py-[10px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer ${
                    pathname === item.slug ? 'text-hover' : 'text-items'
                  }`}
                >
                  <span className="text-[13px] font-medium">{item.name}</span>
                </Link>
              </li>
            ))}

            <li>
              <button
                type="button"
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between px-[16px] w-[100%] h-[40px] py-[10px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer text-items"
              >
                <span className="text-[13px] font-medium">Thể loại</span>
                {expandedSection === 'categories' ? (
                  <ChevronUp className="w-[16px] h-[16px]" />
                ) : (
                  <ChevronDown className="w-[16px] h-[16px]" />
                )}
              </button>
              {expandedSection === 'categories' && (
                <ul className="pl-[12px]">
                  {categoriesFilm.map((item, index: number) => (
                    <li key={index}>
                      <Link
                        href={`/the-loai/${String(item.slug ?? '')}`}
                        onClick={() => onOpenChange(false)}
                        className={`flex items-center px-[16px] w-[100%] h-[36px] py-[8px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer ${
                          pathname === `/the-loai/${item.slug}` ? 'text-hover' : 'text-items'
                        }`}
                      >
                        <span className="text-[12px] font-medium">{String(item.name ?? '')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li>
              <button
                type="button"
                onClick={() => toggleSection('countries')}
                className="flex items-center justify-between px-[16px] w-[100%] h-[40px] py-[10px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer text-items"
              >
                <span className="text-[13px] font-medium">Quốc gia</span>
                {expandedSection === 'countries' ? (
                  <ChevronUp className="w-[16px] h-[16px]" />
                ) : (
                  <ChevronDown className="w-[16px] h-[16px]" />
                )}
              </button>
              {expandedSection === 'countries' && (
                <ul className="pl-[12px]">
                  {countriesCategoryFilm.map((item, index: number) => (
                    <li key={index}>
                      <Link
                        href={`/quoc-gia/${String(item.slug ?? '')}`}
                        onClick={() => onOpenChange(false)}
                        className={`flex items-center px-[16px] w-[100%] h-[36px] py-[8px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer ${
                          pathname === `/quoc-gia/${item.slug}` ? 'text-hover' : 'text-items'
                        }`}
                      >
                        <span className="text-[12px] font-medium">{String(item.name ?? '')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </DialogContent>
    </Dialog>
  );
};

export default BarMenu;
