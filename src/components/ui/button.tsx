"use client";

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-primary hover:text-hover transition-colors ease duration-300",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "bg-transparent border border-solid rounded-[4px]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  to?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  primary?: boolean;
  outline?: boolean;
  rounded?: boolean;
  text?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      to,
      leftIcon = null,
      rightIcon = null,
      primary = false,
      outline = false,
      rounded = false,
      disabled = false,
      text = false,
      onClick,
      variant,
      size,
      ...passProps
    },
    ref
  ) => {
    const btnRef = React.useRef<HTMLButtonElement | null>(null);
    const rippleRef = React.useRef<HTMLSpanElement | null>(null);

    const resolvedRef = (node: HTMLButtonElement | null) => {
      btnRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    };

    const btnStyles = cn(
      "relative flex items-center justify-center text-primary font-normal hover:text-hover transition-colors ease duration-300 overflow-hidden",
      {
        "rounded-[4px] bg-bg-btn-primary": primary && !disabled,
        "bg-transparent border border-solid rounded-[4px]": outline,
        "rounded-[50%]": rounded,
        "opacity-65 cursor-default pointer-events-none select-none": disabled,
      },
      className
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!btnRef.current || !rippleRef.current) {
        if (onClick) onClick(e);
        return;
      }

      const rect = btnRef.current.getBoundingClientRect();
      const positionLeft = e.clientX - rect.left;
      const positionTop = e.clientY - rect.top;
      const diameter = Math.max(btnRef.current.clientWidth, btnRef.current.clientHeight);

      rippleRef.current.style.width = diameter + "px";
      rippleRef.current.style.height = diameter + "px";
      rippleRef.current.style.top = positionTop - diameter / 2 + "px";
      rippleRef.current.style.left = positionLeft - diameter / 2 + "px";

      rippleRef.current.classList.add("ripple-frame");

      setTimeout(() => {
        if (rippleRef.current) rippleRef.current.classList.remove("ripple-frame");
      }, 400);

      if (onClick) onClick(e);
    };

    if (to) {
      return (
        <Link
          href={to}
          className={btnStyles}
          onClick={handleClick as any}
          {...(passProps as any)}
        >
          {leftIcon && <i className="pointer-events-none">{leftIcon}</i>}
          <span className="transition-colors ease duration-300 pointer-events-none">
            {children}
          </span>
          {rightIcon && <i className="">{rightIcon}</i>}
          <span ref={rippleRef} className="absolute pointer-events-none"></span>
        </Link>
      );
    }

    return (
      <button
        className={btnStyles}
        ref={resolvedRef}
        onClick={handleClick}
        disabled={disabled}
        {...passProps}
      >
        {leftIcon && <i className="pointer-events-none flex items-center justify-center">{leftIcon}</i>}
        <span className="transition-colors ease duration-300 pointer-events-none">
          {children}
        </span>
        {rightIcon && <i className="flex items-center justify-center">{rightIcon}</i>}
        <span ref={rippleRef} className="absolute pointer-events-none"></span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
