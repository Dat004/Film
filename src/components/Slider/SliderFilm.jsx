import { useLayoutEffect, useRef, useState } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

import HeaderContainer from "../Container/HeaderContainer";
import { Swiper, SwiperSlide } from "../Swiper";
import { FilmElement } from "../Element";
import Button from "../Button";

function SliderFilm({ value = {}, title = "", to = "" }) {
  const swiperRef = useRef();
  const bgMovieRef = useRef();
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    handleGetHeight();
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
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
  }, []);

  const handleGetHeight = () => {
    if (bgMovieRef.current) {
      setHeight(bgMovieRef.current.clientHeight);
    }
  };

  const handleNextSlide = () => {
    swiperRef.current?.swiper?.slideNext(400);
  };

  const handlePrevSlide = () => {
    swiperRef.current?.swiper?.slidePrev(400);
  };

  return (
    <div className="relative group/cards">
      <HeaderContainer
        title={value?.data?.titlePage || title}
        to={value?.data?.type_list || to}
        isShowAll
      />
      <div className="relative">
        <Swiper
          mousewheel={{ enabled: true, forceToAxis: true }}
          freeMode={{ enabled: true, minimumVelocity: 0.5, sticky: false }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            320: {
              slidesPerView: 2,
            },
            641: {
              slidesPerView: 3,
            },
            769: {
              slidesPerView: 4,
            },
            1281: {
              slidesPerView: 5,
            },
          }}
          ref={swiperRef}
          spaceBetween={12}
          loop
        >
          <>
            {value?.items?.map((items) => (
              <SwiperSlide key={items?._id}>
                <FilmElement ref={bgMovieRef} data={items} />
              </SwiperSlide>
            ))}
            {value?.data?.items?.map((items) => (
              <SwiperSlide key={items?._id}>
                <FilmElement
                  ref={bgMovieRef}
                  data={items}
                  baseUrl={value?.data?.APP_DOMAIN_CDN_IMAGE}
                />
              </SwiperSlide>
            ))}
          </>
        </Swiper>
        <div
          style={{ height: `${height}px` }}
          role="button"
          onClick={handleNextSlide}
          className="absolute z-10 right-0 top-0 w-[6%] bg-bg-linear-to-right group-hover/cards:opacity-100 transition-opacity duration-500 opacity-0 mdm:opacity-100 flex items-center justify-center cursor-pointer"
        >
          <Button
            aria-label="next-btn"
            onClick={handleNextSlide}
            className="text-[30px]"
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
            onClick={handlePrevSlide}
            className="text-[30px]"
          >
            <GrPrevious />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SliderFilm;
