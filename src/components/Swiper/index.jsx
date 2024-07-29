import { useEffect, forwardRef } from "react";
import { register } from "swiper/element/bundle";

export const Swiper = forwardRef(({ children, ...props }, ref) => {
  useEffect(() => {
    // Register Swiper web component
    register();

    // pass component props to parameters
    const params = {
      ...props,
    };

    // Assign it to swiper element
    Object.assign(ref?.current, params);

    // initialize swiper
    ref?.current.initialize();
  }, []);

  return (
    <>
      <swiper-container
        style={{
          "--swiper-preloader-color": "#fff",
          "--swiper-pagination-color": "#fff",
          "--swiper-pagination-bullet-inactive-color": "#fff",
          "--swiper-pagination-bullet-inactive-opacity": "0.2",
          "--swiper-pagination-bullet-size": "12px",
          "--swiper-pagination-bullet-horizontal-gap": "4px",
        }}
        init="false"
        ref={ref}
      >
        {children}
      </swiper-container>
    </>
  );
});

export function SwiperSlide({ children, ...props }) {
  return <swiper-slide {...props}>{children}</swiper-slide>;
}
