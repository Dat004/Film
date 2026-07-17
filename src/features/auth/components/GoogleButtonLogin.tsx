'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { GoogleIcon } from '@/icons';
import { cn } from '@/lib/utils';

export interface GoogleButtonLoginProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  isLoading?: boolean;
}

const GoogleButtonLogin: React.FC<GoogleButtonLoginProps> = ({
  className,
  isLoading = false,
  disabled,
  ...props
}) => {
  const btnStyles = cn(
    'group flex w-full items-center justify-center gap-3',
    'h-[52px] rounded-[12px]',
    'bg-white text-[#1f1f1f]',
    'border border-black/10',
    'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]',
    'transition-[transform,box-shadow,background-color] duration-200 ease-out',
    'hover:bg-[#f7f7f7] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.12)]',
    'active:scale-[0.985]',
    'disabled:pointer-events-none disabled:opacity-65',
    'font-[Montserrat,sans-serif]',
    className
  );

  return (
    <Button className={btnStyles} disabled={disabled || isLoading} {...(props as object)}>
      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-[#5f6368]" aria-hidden />
      ) : (
        <GoogleIcon />
      )}
      <span className="text-[15px] font-semibold tracking-[-0.01em]">
        {isLoading ? 'Đang đăng nhập...' : 'Tiếp tục với Google'}
      </span>
    </Button>
  );
};

export default GoogleButtonLogin;
