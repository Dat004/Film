"use client";

import * as React from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

import { Swiper, SwiperSlide } from "./film-swiper";
import { FilmElement } from "@/components/Element";
import Button from "@/components/ui/button";

interface FilmSliderHomeProps {
  value?: Record<string, any>;
  title?: string;
  to?: string;
}

export function FilmSliderHome({ value = {}, title = "", to = "" }: FilmSliderHomeProps) {
  const swiperRef = React.useRef<any>(null);
  const bgMovieRef = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState(0);

  const handleGetHeight = React.useCallback(() => {
    if (bgMovieRef.current) {
      setHeight(bgMovieRef.current.clientHeight);
    }
  }, []);

  React.useLayoutEffect(() => {
    handleGetHeight();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === bgMovieRef.current) {
          setHeight(entry.contentRect.height);
        }
      }
    });

    if (bgMovieRef.current) {
      observer.observe(bgMovieRef.current);
    }

    return () => {
      if (bgMovieRef.current) {
        observer.unobserve(bgMovieRef.current);
      }
    };
  }, [handleGetHeight]);

  const handleNextSlide = () => {
    swiperRef.current?.swiper?.slideNext(400);
  };

  const handlePrevSlide = () => {
    swiperRef.current?.swiper?.slidePrev(400);
  };

  const cdnImage = value?.data?.APP_DOMAIN_CDN_IMAGE || "";
  const sliderTitle = value?.data?.titlePage || title;
  const viewAllPath = value?.data?.type_list || to;

  return (
    <div className="relative group/cards">
      {/* Header section replacing HeaderContainer */}
      <div className="flex items-center mb-[16px]">
        <h3 className="text-[24px] capitalize text-primary font-semibold">
          {sliderTitle}
        </h3>
        {viewAllPath && (
          <div className="ml-auto">
            <Button className="text-[14px]" to={viewAllPath}>
              Xem tất cả
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <Swiper
          mousewheel={{ enabled: true, forceToAxis: true }}
          freeMode={{ enabled: true, minimumVelocity: 0.5, sticky: false }}
          breakpoints={{
            0: { slidesPerView: 1 },
            320: { slidesPerView: 2 },
            641: { slidesPerView: 3 },
            769: { slidesPerView: 4 },
            1281: { slidesPerView: 5 },
          }}
          ref={swiperRef}
          spaceBetween={12}
          loop
        >
          {value?.items?.map((item: any) => (
            <SwiperSlide key={item?._id}>
              <FilmElement ref={bgMovieRef as any} data={item} />
            </SwiperSlide>
          ))}
          {value?.data?.items?.map((item: any) => (
            <SwiperSlide key={item?._id}>
              <FilmElement
                ref={bgMovieRef as any}
                data={item}
                baseUrl={cdnImage}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {height > 0 && (
          <>
            <div
              style={{ height: `${height}px` }}
              role="button"
              onClick={handleNextSlide}
              className="absolute z-10 right-0 top-0 w-[6%] bg-bg-linear-to-right group-hover/cards:opacity-100 transition-opacity duration-500 opacity-0 mdm:opacity-100 flex items-center justify-center cursor-pointer"
            >
              <Button
                aria-label="next-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextSlide();
                }}
                className="text-[30px] !text-primary [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]"
              >
                <GrNext />
              </Button>
            </div>
            <div
              style={{ height: `${height}px` }}
              role="button"
              onClick={handlePrevSlide}
              className="absolute z-10 left-0 top-0 w-[6%] bg-bg-linear-to-left group-hover/cards:opacity-100 transition-opacity duration-500 opacity-0 mdm:opacity-100 flex items-center justify-center cursor-pointer"
            >
              <Button
                aria-label="prev-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevSlide();
                }}
                className="text-[30px] !text-primary [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]"
              >
                <GrPrevious />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FilmSliderHome;
