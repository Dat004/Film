"use client";

import * as React from "react";
import Link from "next/link";
import NextImage from "next/image";

import images from "@/assets/images";
import Button from "@/components/ui/button";
import { dataFooter } from "@/data";
import { PcaIcon, PcIcon, PhoneIcon, TvIcon } from "@/icons";

export function Footer() {
  return (
    <footer className="w-full bg-bg-footer">
      <div className="mx-auto max-w-[904px] clm:max-w-[668px] mdm:max-w-full mdm:mx-[35px] py-[30px]">
        <div className="text-center">
          <h1 className="text-[20px] text-primary font-medium">
            Trải nghiệm tốt nhất chỉ có trên iQIYI APP
          </h1>
          <span className="text-[12px] text-title whitespace-normal leading-[12px]">
            Tìm kiếm trong cửa hàng ứng dụng dành cho thiết bị di động
          </span>
        </div>
        
        <div className="flex justify-evenly gap-y-[15px] my-[32px] mdm:flex-wrap">
          <div className="mdm:hidden">
            <Button
              leftIcon={<PcaIcon />}
              className="footer-app-btn rounded-[5px] w-full min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Thiết bị đầu cuối máy tính
            </Button>
          </div>
          <div className="mdm:flex-grow mdm:w-full mdm:flex-shrink-0">
            <Button
              leftIcon={<PhoneIcon />}
              className="rounded-[5px] w-full min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Trên điện thoại
            </Button>
          </div>
          <div className="mdm:flex-shrink-0 mdm:flex-grow-0 mdm:w-[calc(50%-10px)] mdm:mr-auto">
            <Button
              leftIcon={<TvIcon />}
              className="footer-app-btn rounded-[5px] w-full min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Trên TV
            </Button>
          </div>
          <div className="mdm:flex-shrink-0 mdm:flex-grow-0 mdm:w-[calc(50%-10px)] mdm:ml-auto">
            <Button
              leftIcon={<PcIcon />}
              className="footer-app-btn rounded-[5px] w-full min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Trên trang web
            </Button>
          </div>
        </div>

        <div className="w-full h-[1px] bg-[var(--bg-divider-muted)]"></div>
        
        <div className="hidden clm:block my-[20px]">
          <div className="flex">
            <div className="mr-auto">
              <Button
                className="text-[12px] gap-x-[6px] px-[10px] py-[5px] !border-bd-select-menu"
                leftIcon={
                  <NextImage
                    alt="global-img"
                    className="!w-[16px] !h-[16px]"
                    src={images.lang}
                    width={16}
                    height={16}
                  />
                }
                rightIcon={
                  <NextImage
                    alt="down-arrow-img"
                    className="!w-[16px] !h-[16px]"
                    src={images.downArrow}
                    width={16}
                    height={16}
                  />
                }
                outline
              >
                Tiếng Việt
              </Button>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-x-[15px] mdm:gap-x-[8px]">
                <div>
                  <Link
                    aria-label="fb-icon"
                    href=""
                    style={{ backgroundImage: `url(${(images.facebookIcon as any).src || images.facebookIcon})` }}
                    className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                  ></Link>
                </div>
                <div>
                  <Link
                    aria-label="is-icon"
                    href=""
                    style={{ backgroundImage: `url(${(images.instagramIcon as any).src || images.instagramIcon})` }}
                    className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                  ></Link>
                </div>
                <div>
                  <Link
                    aria-label="tw-icon"
                    href=""
                    style={{ backgroundImage: `url(${(images.twitterIcon as any).src || images.twitterIcon})` }}
                    className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                  ></Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex mdm:hidden">
          <div className="my-[20px] w-[75%] clm:w-full">
            <div className="flex mx-[-15px]">
              {dataFooter.map((section) => (
                <div className="px-[15px] flex-1" key={section.id}>
                  <div className="w-full">
                    <p className="text-primary text-[14px] font-normal">
                      {section.title}
                    </p>
                    <ul className="max-w-[90%]">
                      {section.items.map((value) => (
                        <li key={value.id} className="mt-[16px] leading-[1]">
                          <Link
                            href={value.path ? `/${value.path}` : "/"}
                            className="text-[13px] text-title whitespace-normal hover:underline"
                          >
                            {value.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ml-auto mt-[20px] clm:hidden">
            <Button
              className="text-[12px] gap-x-[6px] px-[10px] py-[5px] !border-bd-select-menu"
              leftIcon={
                <NextImage
                  alt="lang"
                  className="!w-[16px] !h-[16px]"
                  src={images.lang}
                  width={16}
                  height={16}
                />
              }
              rightIcon={
                <NextImage
                  alt="down-arrow"
                  className="!w-[16px] !h-[16px]"
                  src={images.downArrow}
                  width={16}
                  height={16}
                />
              }
              outline
            >
              Tiếng Việt
            </Button>
          </div>
        </div>

        <div className="flex">
          <div className="w-[75%] clm:w-full">
            <div className="text-[12px] text-title">
              <p className="whitespace-normal mb-[10px]">
                Copyright © 2024 Me All Rights Reserved
              </p>
              <p className="whitespace-normal leading-[1.2]">
                Chúng tôi sử dụng Cookies để cải thiện trải nghiệm sử dụng của
                bạn. Nếu bạn tiếp tục sử dụng trang web của chúng tôi, có nghĩa
                là bạn đồng ý chúng tôi sử dụng Cookies
              </p>
            </div>
          </div>
          <div className="ml-auto mt-[20px] clm:hidden">
            <div className="flex items-center gap-x-[15px]">
              <div>
                <Link
                  aria-label="fb-icon"
                  href=""
                  style={{ backgroundImage: `url(${(images.facebookIcon as any).src || images.facebookIcon})` }}
                  className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                ></Link>
              </div>
              <div>
                <Link
                  aria-label="is-icon"
                  href=""
                  style={{ backgroundImage: `url(${(images.instagramIcon as any).src || images.instagramIcon})` }}
                  className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                ></Link>
              </div>
              <div>
                <Link
                  aria-label="tw-icon"
                  href=""
                  style={{ backgroundImage: `url(${(images.twitterIcon as any).src || images.twitterIcon})` }}
                  className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                ></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
