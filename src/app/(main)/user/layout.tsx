'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import data from '@/constants';
import { useAuth } from '@/features/auth';
import { pushRoute } from '@/lib/route-navigation';

export interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const slideRef = useRef<HTMLSpanElement>(null);

  const { isLogged, user, avatar } = useAuth();
  const { dataUserMenu } = data;

  const handleSetTabIndex = (index: number) => {
    const item = itemsRef.current[index];
    if (!item) return;
    const isActivePage = item.dataset.active === 'true';

    if (isActivePage && slideRef.current) {
      const width = item.offsetWidth;
      const left = item.getBoundingClientRect().left;

      slideRef.current.style.width = width + 'px';
      slideRef.current.style.left = left - 15 + 'px';
    }
  };

  useEffect(() => {
    if (!isLogged) pushRoute(router, '/');
  }, [isLogged, router]);

  useEffect(() => {
    if (itemsRef.current.length > 0) {
      itemsRef.current.forEach((item, index) => {
        if (!item) return;
        const active = item.dataset.active === 'true';

        if (active) {
          handleSetTabIndex(index);
        }
      });
    }
  }, [pathname]);

  if (!isLogged) return null;

  return (
    <div className="w-full relative">
      <section className="relative pt-[40px] mb-[30px] overflow-hidden">
        <div
          style={{ backgroundImage: `url(${(avatar as any)?.src || avatar || ''})` }}
          className="absolute left-0 right-0 top-[-20px] bottom-[-20px] blur-[20px] opacity-40 bg-center bg-cover bg-no-repeat"
        ></div>
        <div className="relative px-[15px]">
          <h1 className="text-primary text-[30px] text-center mb-[15px] font-medium">
            Hi, {user?.displayName || 'User'}
          </h1>
          <FlexContainer className="relative items-center justify-center">
            {dataUserMenu.map((item: any, index: number) => {
              const { Icon } = item;
              const isActive = pathname === item.path;

              return (
                <FlexItems key={item.id}>
                  <div
                    data-active={isActive ? 'true' : 'false'}
                    onClick={() => handleSetTabIndex(index)}
                    ref={(ref) => {
                      itemsRef.current[index] = ref;
                    }}
                    className="mx-[15px]"
                  >
                    <Link
                      href={item.path}
                      className={`${
                        isActive ? 'text-primary' : 'text-secondary'
                      } hover:text-primary flex items-center py-[15px] px-[10px] leading-[1.25]`}
                    >
                      <i className="size-[15px] mdm:size-[20px]">
                        {Icon && <Icon width="100%" height="100%" />}
                      </i>
                      <span className="mdm:hidden text-[14px] ml-[6px]">{item.title}</span>
                    </Link>
                  </div>
                </FlexItems>
              );
            })}
            <span
              ref={slideRef}
              className="absolute h-px bg-primary bottom-0 transition-all duration-300"
            ></span>
          </FlexContainer>
        </div>
      </section>

      <div className="3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl px-[15px] mx-auto pb-[30px]">
        {children}
      </div>
    </div>
  );
}
