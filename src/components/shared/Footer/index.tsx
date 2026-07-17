import Link from 'next/link';
import React from 'react';

import images from '@/assets/images';
import Button from '@/components/ui/Button';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import Image from '@/components/ui/Image';
import data from '@/constants';
import { PcaIcon, PcIcon, PhoneIcon, TvIcon } from '@/icons';

const Footer: React.FC = () => {
  return (
    <footer className="w-[100%] bg-bg-footer">
      <div className="mx-auto max-w-[904px] clm:max-w-[668px] mdm:max-w-[100%] mdm:mx-[35px] py-[30px]">
        <div className="text-center">
          <h1 className="text-[20px] text-primary font-medium">
            Trải nghiệm tốt nhất chỉ có trên iQIYI APP
          </h1>
          <span className="text-[12px] text-title whitespace-normal leading-[12px]">
            Tìm kiếm trong cửa hàng ứng dụng dành cho thiết bị di động
          </span>
        </div>
        <FlexContainer className="justify-evenly !gap-y-[15px] my-[32px] mdm:flex-wrap">
          <FlexItems className="mdm:hidden">
            <Button
              leftIcon={<PcaIcon />}
              className="footer-app-btn rounded-[5px] w-[100%] min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Thiết bị đầu cuối máy tính
            </Button>
          </FlexItems>
          <FlexItems className="mdm:flex-grow mdm:w-[100%] mdm:flex-shrink-0">
            <Button
              leftIcon={<PhoneIcon />}
              className="rounded-[5px] w-[100%] min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Trên điện thoại
            </Button>
          </FlexItems>
          <FlexItems className="mdm:flex-shrink-0 mdm:flex-grow-0 mdm:w-[calc(50%-10px)] mdm:mr-auto">
            <Button
              leftIcon={<TvIcon />}
              className="footer-app-btn rounded-[5px] w-[100%] min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Trên TV
            </Button>
          </FlexItems>
          <FlexItems className="mdm:flex-shrink-0 mdm:flex-grow-0 mdm:w-[calc(50%-10px)] mdm:ml-auto">
            <Button
              leftIcon={<PcIcon />}
              className="footer-app-btn rounded-[5px] w-[100%] min-w-[132px] mdm:min-w-[100px] leading-[1.35] text-[14px] gap-[4px] py-[10px] px-[12px] bg-bg-multiport"
            >
              Trên trang web
            </Button>
          </FlexItems>
        </FlexContainer>
        <div className="w-[100%] h-[1px] bg-[var(--bg-divider-muted)]"></div>
        <div className="hidden clm:block my-[20px]">
          <FlexContainer>
            <FlexItems className="mr-auto">
              <Button
                className="text-[12px] gap-x-[6px] px-[10px] py-[5px] !border-bd-select-menu"
                leftIcon={
                  <Image
                    alt="global-img"
                    className="!w-[16px] !h-[16px]"
                    src={(images.lang as any).src || images.lang}
                    cover
                  />
                }
                rightIcon={
                  <Image
                    alt="down-arrow-img"
                    className="!w-[16px] !h-[16px]"
                    src={(images.downArrow as any).src || images.downArrow}
                    cover
                  />
                }
                outline
              >
                Tiếng Việt
              </Button>
            </FlexItems>
            <FlexItems className="ml-auto">
              <FlexContainer className="items-center gap-x-[15px] mdm:gap-x-[8px]">
                <FlexItems>
                  <Link
                    href="/"
                    aria-label="fb-icon"
                    style={{
                      backgroundImage: `url(${(images.facebookIcon as any).src || images.facebookIcon})`,
                    }}
                    className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                  />
                </FlexItems>
                <FlexItems>
                  <Link
                    href="/"
                    aria-label="is-icon"
                    style={{
                      backgroundImage: `url(${(images.instagramIcon as any).src || images.instagramIcon})`,
                    }}
                    className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                  />
                </FlexItems>
                <FlexItems>
                  <Link
                    href="/"
                    aria-label="tw-icon"
                    style={{
                      backgroundImage: `url(${(images.twitterIcon as any).src || images.twitterIcon})`,
                    }}
                    className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                  />
                </FlexItems>
              </FlexContainer>
            </FlexItems>
          </FlexContainer>
        </div>
        <FlexContainer className="mdm:hidden">
          <FlexItems className="my-[20px] w-[75%] clm:w-[100%]">
            <FlexContainer className="mx-[-15px]">
              {data.dataFooter?.map((items: any) => (
                <FlexItems className="px-[15px]" key={items.id}>
                  <div className="w-[100%]">
                    <p className="text-primary text-[14px] font-normal">{items.title}</p>
                    <ul className="max-w-[90%]">
                      {items?.items?.map((value: any) => (
                        <li key={value.id} className="mt-[16px] leading-[1]">
                          <Link
                            href={`/${value.path}`}
                            className="text-[13px] text-title whitespace-normal"
                          >
                            {value.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FlexItems>
              ))}
            </FlexContainer>
          </FlexItems>
          <FlexItems className="ml-auto mt-[20px] clm:hidden">
            <Button
              className="text-[12px] gap-x-[6px] px-[10px] py-[5px] !border-bd-select-menu"
              leftIcon={
                <Image
                  alt="global-img"
                  className="!w-[16px] !h-[16px]"
                  src={(images.lang as any).src || images.lang}
                  cover
                />
              }
              rightIcon={
                <Image
                  alt="down-arrow-img"
                  className="!w-[16px] !h-[16px]"
                  src={(images.downArrow as any).src || images.downArrow}
                  cover
                />
              }
              outline
            >
              Tiếng Việt
            </Button>
          </FlexItems>
        </FlexContainer>
        <FlexContainer>
          <FlexItems className="w-[75%] clm:w-[100%]">
            <div className="text-[12px] text-title">
              <p className="whitespace-normal mb-[10px]">Copyright © 2024 Me All Rights Reserved</p>
              <p className="whitespace-normal leading-[1.2]">
                Chúng tôi sử dụng Cookies để cải thiện trải nghiệm sử dụng của bạn. Nếu bạn tiếp tục
                sử dụng trang web của chúng tôi, có nghĩa là bạn đồng ý chúng tôi sử dụng Cookies
              </p>
            </div>
          </FlexItems>
          <FlexItems className="ml-auto mt-[20px] clm:hidden">
            <FlexContainer className="items-center gap-x-[15px]">
              <FlexItems>
                <Link
                  href="/"
                  aria-label="fb-icon"
                  style={{
                    backgroundImage: `url(${(images.facebookIcon as any).src || images.facebookIcon})`,
                  }}
                  className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                />
              </FlexItems>
              <FlexItems>
                <Link
                  href="/"
                  aria-label="is-icon"
                  style={{
                    backgroundImage: `url(${(images.instagramIcon as any).src || images.instagramIcon})`,
                  }}
                  className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                />
              </FlexItems>
              <FlexItems>
                <Link
                  href="/"
                  aria-label="tw-icon"
                  style={{
                    backgroundImage: `url(${(images.twitterIcon as any).src || images.twitterIcon})`,
                  }}
                  className="footer-social-link block h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                />
              </FlexItems>
            </FlexContainer>
          </FlexItems>
        </FlexContainer>
      </div>
    </footer>
  );
};

export default Footer;
