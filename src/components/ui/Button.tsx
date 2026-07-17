'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import React, { useRef } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative flex items-center justify-center text-primary font-normal hover:text-hover transition-colors ease duration-300 overflow-hidden',
  {
    variants: {
      primary: {
        true: 'rounded-[4px] bg-bg-btn-primary',
        false: '',
      },
      outline: {
        true: 'bg-transparent border border-solid rounded-[4px]',
        false: '',
      },
      rounded: {
        true: 'rounded-[50%]',
        false: '',
      },
    },
    defaultVariants: {
      primary: false,
      outline: false,
      rounded: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  to?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  text?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      to,
      leftIcon = false,
      rightIcon = false,
      primary = false,
      outline = false,
      rounded = false,
      disabled = false,
      text = false,
      asChild = false,
      onClick,
      type: _type,
      ...passProps
    },
    forwardedRef
  ) => {
    const btnRef = useRef<HTMLElement>(null);
    const rippleRef = useRef<HTMLSpanElement>(null);

    const btnStyles = cn(
      buttonVariants({ primary: primary && !disabled, outline, rounded }),
      disabled && 'opacity-65 cursor-default pointer-events-none select-none',
      className
    );

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      const el = btnRef.current;
      if (!el || !rippleRef.current) return;

      const rect = el.getBoundingClientRect();
      const positionLeft = e.clientX - rect.left;
      const positionTop = e.clientY - rect.top;
      const diameter = Math.max(el.clientWidth, el.clientHeight);

      rippleRef.current.style.width = `${diameter}px`;
      rippleRef.current.style.height = `${diameter}px`;
      rippleRef.current.style.top = `${positionTop - diameter / 2}px`;
      rippleRef.current.style.left = `${positionLeft - diameter / 2}px`;
      rippleRef.current.classList.add('ripple-frame');

      setTimeout(() => {
        rippleRef.current?.classList.remove('ripple-frame');
      }, 400);

      onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    };

    const setRef = (node: HTMLElement | null) => {
      (btnRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node as HTMLButtonElement);
      else if (forwardedRef) forwardedRef.current = node as HTMLButtonElement;
    };

    const content = (
      <>
        {leftIcon && <i className="pointer-events-none">{leftIcon}</i>}
        <span className="transition-colors ease duration-300 pointer-events-none">{children}</span>
        {rightIcon && <i>{rightIcon}</i>}
        <span ref={rippleRef} className="absolute pointer-events-none" />
      </>
    );

    if (to) {
      return (
        <Link
          href={to}
          className={btnStyles}
          ref={setRef as React.Ref<HTMLAnchorElement>}
          onClick={handleClick}
        >
          {content}
        </Link>
      );
    }

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={btnStyles}
        ref={setRef as React.Ref<HTMLButtonElement>}
        onClick={handleClick}
        disabled={disabled}
        type={asChild ? undefined : _type || 'button'}
        {...passProps}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button, buttonVariants };
