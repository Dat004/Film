import Link from 'next/link';
import React, { useMemo, forwardRef } from 'react';

import Button from '@/components/ui/Button';
import { DropdownMenuItem } from '@/components/ui/DropdownMenu';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import Image from '@/components/ui/Image';
import { ToastMessage } from '@/components/ui/Toastify';
import { useAuth } from '@/features/auth';
import type { UserInfo } from '@/features/auth';
import { LogoutIcon } from '@/icons';
import { cn } from '@/lib/utils';

export interface MenuUserProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: UserInfo;
  dataMenu?: readonly {
    id: string | number;
    title: string;
    path: string;
    Icon: React.ComponentType<{ width?: string; height?: string }>;
  }[];
  onClose?: () => void;
}

const MenuUser = forwardRef<HTMLDivElement, MenuUserProps>(
  ({ data = {}, dataMenu = [], onClose = () => {}, className, ...props }, ref) => {
    const { displayName, email } = data;
    const { avatar, logout } = useAuth();

    const memoizedAvatar = useMemo(
      () => <Image cover className="rounded-[50%]" src={avatar || ''} />,
      [avatar]
    );

    const handleLogout = async () => {
      await logout();
      ToastMessage.success('Đã đăng xuất ra khỏi tài khoản!');
      onClose();
    };

    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          className,
          'min-w-[200px] overflow-hidden rounded-[6px] border border-solid border-bd-filed-form-color bg-bg-sidebar shadow-lg'
        )}
      >
        <header className="py-[12px] px-[15px] border-b border-solid border-bd-filed-form-color outline-none">
          <FlexContainer className="items-center">
            <FlexItems className="size-[32px]">{memoizedAvatar}</FlexItems>
            <FlexItems className="text-[14px] text-primary ml-[10px]">
              <p className="font-medium leading-[1.18]">{displayName}</p>
              <p className="leading-[1.18]">{email}</p>
            </FlexItems>
          </FlexContainer>
        </header>
        {dataMenu.map((item) => {
          const { Icon } = item;

          return (
            <DropdownMenuItem
              asChild
              key={item.id}
              className="outline-none focus:bg-bg-multiport p-0"
            >
              <Link className="text-primary block cursor-pointer" href={item.path}>
                <FlexContainer className="p-[12px] px-[15px] items-center transition-colors">
                  <FlexItems>
                    <i className="block size-[20px]">
                      <Icon width="100%" height="100%" />
                    </i>
                  </FlexItems>
                  <FlexItems className="ml-[10px]">
                    <p className="text-[14px] font-normal">{item.title}</p>
                  </FlexItems>
                </FlexContainer>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <footer className="border-t border-solid border-bd-filed-form-color">
          <DropdownMenuItem asChild className="outline-none focus:bg-bg-multiport p-0">
            <Button
              onClick={handleLogout}
              className="py-[12px] px-[15px] text-[14px] text-primary !justify-start w-[100%] gap-x-[10px] font-normal transition-colors cursor-pointer rounded-none"
              leftIcon={<LogoutIcon />}
            >
              Đăng xuất
            </Button>
          </DropdownMenuItem>
        </footer>
      </div>
    );
  }
);

MenuUser.displayName = 'MenuUser';

export default MenuUser;
