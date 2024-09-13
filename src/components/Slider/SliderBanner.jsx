import { useEffect, useRef } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

import Button from "../Button";
import { BannerElement } from "../Element";
import { Swiper, SwiperSlide } from "../Swiper";

function SliderBanner({ data = {} }) {
  const swiperRef = useRef();
  const { APP_DOMAIN_CDN_IMAGE, itemsBanner } = data;

  useEffect(() => {
    swiperRef.current?.swiper?.on("slideChange", (e) => {});
  }, []);

  const handleNextSlide = () => {
    swiperRef.current?.swiper?.slideNext(600);
  };

  const handlePrevSlide = () => {
    swiperRef.current?.swiper?.slidePrev(600);
  };

  return (
    <div className="relative w-[100%]">
      <Swiper
        ref={swiperRef}
        injectStyles={[
          `
          swiper-horizontal>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic, .swiper-pagination-horizontal.swiper-pagination-bullets.swiper-pagination-bullets-dynamic {
            left: calc(100% - 50px);
          }

          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            text-align: center;
            line-height: 20px;
            font-size: 12px;
            opacity: 0.2;
            background: #fff;
          }

          .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next-next, .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev-prev {
            transform: scale(0.75);
          }

          .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next, .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev {
            transform: scale(1);
          }

          .swiper-pagination-bullet-active {
            opacity: 1;
            background: #fff;
          }
          `,
        ]}
        mousewheel={{ enabled: true, forceToAxis: true, sensitivity: 0.5 }}
        freeMode={{
          enabled: true,
          sticky: true,
          momentumBounceRatio: 0,
          minimumVelocity: 0.02,
          momentumVelocityRatio: 0.05,
        }}
        slidesPerView={1}
        pagination={{
          dynamicBullets: true,
          clickable: true,
          hideOnClick: false,
        }}
        loop
      >
        {itemsBanner?.map((items) => (
          <SwiperSlide key={items?._id}>
            <BannerElement
              data={items}
              backgroundImage={items?.thumb_url}
              baseUrl={APP_DOMAIN_CDN_IMAGE}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        onClick={handlePrevSlide}
        className="absolute left-0 top-0 group/btn h-full flex items-center justify-center cursor-pointer z-10"
      >
        <Button
          aria-label="prev-btn"
          onClick={handlePrevSlide}
          className="text-[40px] opacity-35 group-hover/btn:opacity-100"
        >
          <GrPrevious />
        </Button>
      </div>
      <div
        onClick={handleNextSlide}
        className="absolute right-0 top-0 group/btn h-full flex items-center justify-center cursor-pointer z-10"
      >
        <Button
          aria-label="next-btn"
          onClick={handleNextSlide}
          className="text-[40px] opacity-35 group-hover/btn:opacity-100"
        >
          <GrNext />
        </Button>
      </div>
    </div>
  );
}

export default SliderBanner;
