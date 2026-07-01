"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NextImage from "next/image";

import Button from "@/components/ui/button";
import { BarMenuIcon } from "@/icons";
import images from "@/assets/images";
import { dataMenu } from "@/data";
import BarMenu from "./bar-menu";

interface LeftHeaderProps {
  dataCategory?: any[];
}

export function LeftHeader({ dataCategory = [] }: LeftHeaderProps) {
  const [isShowMenu, setIsShowMenu] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isShowMenu) setIsShowMenu(false);
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isShowMenu]);

  const handleShowMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShowMenu(true);
  };

  return (
    <>
      <BarMenu dataCategory={dataCategory} isShow={isShowMenu} />
      
      <div className="flex items-center">
        <Button
          aria-expanded={isShowMenu}
          aria-haspopup="menu"
          onClick={handleShowMenu}
          className="hidden lgm:block mr-[15px]"
        >
          <BarMenuIcon width="24px" height="24px" />
        </Button>
        
        <Link className="mr-[25px] flex items-center" href="/">
          <NextImage
            className="!w-[125px] !h-auto"
            src={images.logo}
            alt="logo"
            width={125}
            height={40}
            priority
          />
        </Link>
        
        <nav className="flex items-center lgm:hidden">
          {dataMenu.map((item, index) => (
            <Link
              className={`${
                pathname === item.path ? "text-primary font-semibold" : "text-secondary"
              } p-[12px] hover:text-primary cursor-pointer transition-colors text-[16px]`}
              aria-label={item.title}
              href={item.path}
              key={index}
            >
              <span>{item.title}</span>
            </Link>
          ))}
          
          {!!dataCategory?.length && (
            <ul className="flex items-center">
              <li
                className={`${
                  pathname?.split("/")[1] === "the-loai" ? "text-primary font-semibold" : "text-secondary"
                } relative group/table p-[12px] flex items-center hover:text-primary cursor-pointer transition-colors text-[16px]`}
              >
                <span>Thể loại</span>
                <div className="hidden group-hover/table:block absolute left-0 xlm:left-[calc(0%-50px)] top-[100%] cursor-default pt-[10px]">
                  <div className="w-[540px] xlm:w-[350px] p-[12px] max-h-[450px] overflow-y-auto bg-bg-sidebar rounded-[4px] border border-bd-filed-form-color shadow-xl">
                    <div className="flex flex-wrap items-start">
                      {dataCategory[0]?.map((item: any) => (
                        <div
                          className="separator-item flex-shrink-0 w-[25%] xlm:w-[calc(100%/3)] py-[4px]"
                          key={item?._id}
                        >
                          <p className="text-[14px] font-normal">
                            <Link
                              className="text-secondary hover:text-primary px-[12px] w-full block transition-colors"
                              href={`/the-loai/${item?.slug}`}
                            >
                              {item?.name}
                            </Link>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
              
              <li
                className={`${
                  pathname?.split("/")[1] === "quoc-gia" ? "text-primary font-semibold" : "text-secondary"
                } relative group/table p-[12px] flex items-center hover:text-primary cursor-pointer transition-colors text-[16px]`}
              >
                <span>Quốc gia</span>
                <div className="hidden group-hover/table:block absolute left-[calc(0%-81px)] xlm:left-[calc(-20%-114px)] top-[100%] cursor-default pt-[10px]">
                  <div className="w-[540px] xlm:w-[350px] p-[12px] max-h-[450px] overflow-y-auto bg-bg-sidebar rounded-[4px] border border-bd-filed-form-color shadow-xl">
                    <div className="flex flex-wrap items-start">
                      {dataCategory[1]?.map((item: any) => (
                        <div
                          className="separator-item flex-shrink-0 w-[25%] xlm:w-[calc(100%/3)] py-[4px]"
                          key={item?._id}
                        >
                          <p className="text-[14px] font-normal">
                            <Link
                              className="text-secondary hover:text-primary px-[12px] w-full block transition-colors"
                              href={`/quoc-gia/${item?.slug}`}
                            >
                              {item?.name}
                            </Link>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </>
  );
}

export default LeftHeader;
