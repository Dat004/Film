"use client";

import * as React from "react";
import { IoChevronBack, IoChevronForwardOutline } from "react-icons/io5";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import Button from "@/components/ui/button";

interface MenuItem {
  title?: string;
  name?: string;
  slug?: string;
  type?: string;
  isSubMenu?: boolean;
  subMenu?: any;
  [key: string]: any;
}

interface MenuData {
  items: MenuItem[];
  path?: string;
}

interface MenuProps {
  dataMenu?: MenuData;
  className?: string;
  darkMode?: boolean;
  onClick?: (item: MenuItem) => void;
}

export function Menu({
  dataMenu = { items: [] },
  className,
  darkMode = false,
  onClick = () => {},
}: MenuProps) {
  const pathname = usePathname();
  const [menu, setMenu] = React.useState<MenuData[]>([dataMenu]);

  React.useEffect(() => {
    setMenu([dataMenu]);
  }, [dataMenu]);

  const finalMenu = menu[menu.length - 1];

  const menuClasses = cn("min-w-[140px]", {
    [className || ""]: className,
    "bg-bg-white": !darkMode,
  });

  const handleChangeMenu = (e: React.MouseEvent, item: MenuItem) => {
    if (item?.isSubMenu) {
      setMenu((state) => [
        ...state,
        {
          ...item?.subMenu,
        },
      ]);
      return;
    }
    onClick(item);
  };

  const handleBack = () => {
    setMenu((state) => state.filter((_, index) => index !== state.length - 1));
  };

  return (
    <div className={menuClasses}>
      {menu.length > 1 && (
        <Button
          onClick={handleBack}
          aria-label="back-btn"
          className="py-[8px] px-[16px] gap-x-[8px] text-[14px]"
          leftIcon={<IoChevronBack className="text-[18px]" />}
        >
          Quay lại
        </Button>
      )}
      <ul>
        {finalMenu?.items?.map((item, index) => {
          const path = finalMenu.path
            ? finalMenu.path + item?.slug
            : item?.slug || "";

          if (item?.type === "link") {
            return (
              <li key={index} className="relative flex items-center w-full h-[36px] bg-transparent hover:bg-bg-menu-items cursor-pointer">
                <Link
                  href={path}
                  onClick={(e) => handleChangeMenu(e, item)}
                  className="flex items-center px-[12px] w-full h-full leading-[1]"
                >
                  <span
                    className={`text-[12px] ${
                      path === pathname
                        ? "text-hover"
                        : darkMode
                        ? "text-items"
                        : "text-dark"
                    } font-medium`}
                  >
                    {item?.title || item?.name}
                  </span>
                  {item.isSubMenu && (
                    <i className={`${darkMode ? "text-items" : "text-dark"} ml-auto`}>
                      <IoChevronForwardOutline />
                    </i>
                  )}
                </Link>
              </li>
            );
          }

          return (
            <li
              key={index}
              className="relative flex items-center px-[12px] w-full h-[36px] justify-start py-[10px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer"
              onClick={(e) => handleChangeMenu(e, item)}
            >
              <span
                className={`text-[12px] ${
                  path === pathname
                    ? "text-hover"
                    : darkMode
                    ? "text-items"
                    : "text-dark"
                } font-medium`}
              >
                {item?.title || item?.name}
              </span>
              {item.isSubMenu && (
                <i className={`${darkMode ? "text-items" : "text-dark"} ml-auto`}>
                  <IoChevronForwardOutline />
                </i>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Menu;
