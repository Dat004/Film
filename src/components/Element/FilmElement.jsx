import { forwardRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";

import images from "../../assets/images";

const FilmElement = forwardRef(({ data = {}, baseUrl = "" }, ref) => {
  const imageUrl = baseUrl
    ? `${baseUrl}/${data?.poster_url || data?.thumb_url}`
    : data?.poster_url || data?.thumb_url;

  return (
    <>
      <div ref={ref} title={data?.name} className="relative w-[100%] h-full">
        <Link to={`/phim/${data?.slug}`}>
          <div className="pb-[150%] h-0 leading-0">
            <div className="absolute inset-0 rounded-[5px] overflow-hidden">
              <LazyLoadImage
                placeholderSrc={images.imgLoadingVertical}
                className="block h-full object-cover hover:scale-[1.15] transition-transform duration-[350ms] will-change-contents rounded-[5px]"
                alt={data?.name}
                src={imageUrl}
                height="100%"
                width="100%"
                effect="opacity"
              />
            </div>
          </div>
        </Link>
      </div>
      <div className="mt-[20px]">
        <h3 className="text-primary line-clamp-2 text-[16px] font-normal">
          {data?.name}
        </h3>
      </div>
    </>
  );
});

export default FilmElement;
