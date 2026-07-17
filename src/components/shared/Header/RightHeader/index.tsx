'use client';

import { Search, Sun, Moon, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import Image from '@/components/ui/Image';
import data from '@/constants';
import { LoginModal, useAuth } from '@/features/auth';
import { useControlModal } from '@/hooks';
import { pushRoute } from '@/lib/route-navigation';
import { useTheme } from '@/providers/theme-context';

import MenuUser from './MenuUser';

const labelByMode = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

const iconByMode = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

type ThemeMode = 'system' | 'light' | 'dark';

const RightHeader: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { dataUserMenu } = data;
  const { isLogged, user, avatar } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { isShowModal, handleToggleModal, handleCloseModal } = useControlModal();

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  // Use the system theme until hydration completes to match server markup.
  const currentThemeMode: ThemeMode = mounted ? (themeMode as ThemeMode) || 'system' : 'system';
  const ThemeIcon = iconByMode[currentThemeMode];
  const themeLabel = labelByMode[currentThemeMode];

  return (
    <div className="flex items-center gap-[16px]">
      <Button
        className="size-[22px] text-primary"
        onClick={() => pushRoute(router, '/search')}
        aria-label="Tìm kiếm"
      >
        <Search className="size-[22px]" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="size-[34px] text-thirty hover:!text-primary"
            aria-label={`Theme: ${themeLabel}`}
            title={themeLabel}
          >
            <i className="text-[20px] pointer-events-none flex items-center justify-center">
              <ThemeIcon />
            </i>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-[6px] min-w-[168px]" align="end">
          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
            const ItemIcon = iconByMode[mode];
            const isActive = mounted && themeMode === mode;
            return (
              <DropdownMenuItem
                key={mode}
                onSelect={() => handleSelectTheme(mode)}
                className={`flex items-center gap-x-[10px] px-[10px] py-[8px] text-[13px] rounded-[4px] ${
                  isActive ? 'bg-bg-menu-items text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                <ItemIcon className="size-[16px]" />
                <span className="whitespace-nowrap">{labelByMode[mode]}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {mounted && isLogged ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button rounded className="size-[35px] outline-none">
              <Image src={avatar || ''} className="rounded-[50%]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-0" align="end" sideOffset={15} asChild>
            <MenuUser data={user} dataMenu={dataUserMenu} />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button onClick={handleToggleModal} className="text-[14px] text-thirty">
            Đăng nhập
          </Button>
          <LoginModal onClose={handleCloseModal} isShowModal={isShowModal} />
        </>
      )}
    </div>
  );
};

export default RightHeader;
