import * as React from "react";
import { FaPlay } from "react-icons/fa";
import Link from "next/link";

import images from "@/assets/images";
import { DotIcon } from "@/icons";
import Button from "../ui/button";


interface BannerElementProps {
  data?: Record<string, any>;
  baseUrl?: string;
}

export const BannerElement = React.memo(
  ({ data = {}, baseUrl = "" }: BannerElementProps) => {
    const { poster_url, thumb_url } = data;
    const bgFilm = thumb_url || poster_url;

    return (
      <div className="relative w-full h-full flex-shrink-0 lgm:rounded-[4px] pb-[56.25%]">
        <div className="absolute flex inset-0">
          <div className="flex w-full h-full overflow-hidden">
            <img
              className={`flex-shrink-0 flex-grow mdm:rounded-[4px] w-full h-full ${thumb_url ? 'object-cover' : 'object-contain'}`}
              src={baseUrl ? baseUrl + "/" + bgFilm : bgFilm}
              alt={data?.name || 'banner'}
            />
          </div>
        </div>
        <div
          style={{ backgroundImage: `url(${(images as any).bgOpacity?.src || images.bgOpacity})` }}
          className="absolute left-0 bg-center bg-cover bg-no-repeat bottom-0 w-full h-full"
        />
        <div className="absolute left-0 bottom-0 p-[4%] w-[50%] mdm:w-full z-10">
          <h2 className="text-[24px] line-clamp-2 leading-[1.2] font-semibold text-primary">
            <Link href={`/phim/${data?.slug}`}>
              <span>{data?.name}</span>
            </Link>
          </h2>
          <div className="flex items-center flex-wrap mt-[12px] text-[14px] text-primary">
            <span className="mr-[4px]">{data?.year}</span>
            <i className="mr-[4px]">
              <DotIcon />
            </i>
            <span className="mr-[4px]">{data?.time}</span>
            <i className="mr-[4px]">
              <DotIcon />
            </i>
            <span className="mr-[4px]">{data?.episode_current}</span>
          </div>
          <Button
            to={`/phim/${data?.slug}`}
            leftIcon={<FaPlay className="text-[18px]" />}
            className="!inline-flex gap-[12px] leading-[1.35] hover:!text-primary hover:opacity-80 mr-[15px] mdm:p-[10px] mdm:mt-[12px] mt-[24px] py-[14px] px-[44px] text-[16px] !font-medium"
            primary
          >
            Xem ngay
          </Button>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.data?._id === nextProps.data?._id
);

BannerElement.displayName = "BannerElement";
export default BannerElement;
