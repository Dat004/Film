'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full outline-none transition-colors text-primary bg-bg-field border border-bd-filed-form-color focus:border-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'rounded-[8px] p-[16px] h-[48px] text-[16px] detail769:text-[14px]',
        compact: 'rounded-[8px] p-[14px] pr-[42px] h-[46px] text-[16px] detail769:text-[14px]',
        room: 'rounded-xl px-4 py-3 text-center text-[16px] detail769:text-sm focus:border-[var(--hover-color)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => (
    <input type={type} className={cn(inputVariants({ variant }), className)} ref={ref} {...props} />
  )
);
Input.displayName = 'Input';

export { Input, inputVariants };
