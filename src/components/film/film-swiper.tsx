"use client";

import * as React from "react";
import { register } from "swiper/element/bundle";

// Extend JSX IntrinsicElements to support swiper custom elements in TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "swiper-container": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        init?: string;
        [key: string]: any;
      }, HTMLElement>;
      "swiper-slide": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        [key: string]: any;
      }, HTMLElement>;
    }
  }
}

interface SwiperProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  [key: string]: any;
}

export const Swiper = React.forwardRef<any, SwiperProps>(({ children, ...props }, ref) => {
  React.useEffect(() => {
    register();
    const swiperEl = (ref as React.MutableRefObject<any>)?.current;
    if (swiperEl) {
      const params = { ...props };
      Object.assign(swiperEl, params);
      swiperEl.initialize();
    }
  }, [props, ref]);

  return (
    <swiper-container
      style={{
        "--swiper-preloader-color": "var(--primary-color)",
        "--swiper-pagination-color": "var(--primary-color)",
        "--swiper-pagination-bullet-inactive-color": "var(--primary-color)",
        "--swiper-pagination-bullet-inactive-opacity": "0.2",
        "--swiper-pagination-bullet-size": "12px",
        "--swiper-pagination-bullet-horizontal-gap": "4px",
      } as React.CSSProperties}
      init="false"
      ref={ref}
    >
      {children}
    </swiper-container>
  );
});

Swiper.displayName = "Swiper";

export function SwiperSlide({ children, ...props }: any) {
  return <swiper-slide {...props}>{children}</swiper-slide>;
}

export default Swiper;
