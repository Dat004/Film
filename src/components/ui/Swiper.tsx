'use client';

import React, { useEffect, forwardRef } from 'react';
import { register } from 'swiper/element/bundle';

export interface SwiperProps {
  children?: React.ReactNode;
  injectStyles?: string[];
  mousewheel?: {
    enabled?: boolean;
    forceToAxis?: boolean;
    sensitivity?: number;
  };
  freeMode?: {
    enabled?: boolean;
    sticky?: boolean;
    minimumVelocity?: number;
    momentumBounceRatio?: number;
    momentumVelocityRatio?: number;
  };
  slidesPerView?: number;
  spaceBetween?: number;
  breakpoints?: Record<number, { slidesPerView?: number }>;
  pagination?: {
    dynamicBullets?: boolean;
    clickable?: boolean;
    hideOnClick?: boolean;
  };
  loop?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** Swiper web component used by the banner. */
export const Swiper = forwardRef<any, SwiperProps>(
  ({ children, className, style, ...props }, ref: any) => {
    useEffect(() => {
      register();

      const params = { ...props };

      if (ref?.current) {
        Object.assign(ref.current, params);
        ref.current.initialize();
      }
    }, [props, ref]);

    return (
      <swiper-container
        className={className}
        style={
          {
            '--swiper-preloader-color': 'var(--primary-color)',
            '--swiper-pagination-color': 'var(--primary-color)',
            '--swiper-pagination-bullet-inactive-color': 'var(--primary-color)',
            '--swiper-pagination-bullet-inactive-opacity': '0.2',
            '--swiper-pagination-bullet-size': '12px',
            '--swiper-pagination-bullet-horizontal-gap': '4px',
            ...style,
          } as React.CSSProperties
        }
        init="false"
        ref={ref}
      >
        {children}
      </swiper-container>
    );
  }
);

Swiper.displayName = 'Swiper';

export interface SwiperSlideProps {
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const SwiperSlide: React.FC<SwiperSlideProps> = ({ children, ...props }) => {
  return <swiper-slide {...props}>{children}</swiper-slide>;
};
