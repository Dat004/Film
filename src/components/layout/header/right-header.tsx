"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useTheme } from "next-themes";
import { IoSearchOutline } from "react-icons/io5";
import {
  MdOutlineBrightnessAuto,
  MdOutlineDarkMode,
  MdOutlineLightMode,
} from "react-icons/md";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import LoginModal from "@/features/auth/components/login-modal";
import Button from "@/components/ui/button";
import { dataUserMenu } from "@/data";
import MenuUser from "./menu-user";

const labelByMode: Record<string, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const iconByMode: Record<string, React.ComponentType<any>> = {
  system: MdOutlineBrightnessAuto,
  light: MdOutlineLightMode,
  dark: MdOutlineDarkMode,
};

export function RightHeader() {
  const router = useRouter();
  const [showMenu, setShowMenu] = React.useState(false);
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const { theme = "system", setTheme } = useTheme();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userInfo = useAuthStore((state) => state.userInfo);
  const avatar = useAuthStore((state) => state.avatar);

  React.useEffect(() => {
    const handleCloseMenu = () => {
      setShowMenu(false);
      setShowThemeMenu(false);
    };
    window.addEventListener("click", handleCloseMenu);
    return () => {
      window.removeEventListener("click", handleCloseMenu);
    };
  }, [showMenu, showThemeMenu]);

  const handleToggleMenu = () => {
    setShowMenu((state) => !state);
  };

  const handleToggleThemeMenu = () => {
    setShowThemeMenu((state) => !state);
  };

  const handleSelectTheme = (mode: string) => {
    setTheme(mode);
    setShowThemeMenu(false);
  };

  const ThemeIcon = iconByMode[theme] || MdOutlineBrightnessAuto;

  return (
    <div className="flex items-center gap-[16px]">
      <Button
        className="size-[22px] text-primary"
        onClick={() => router.push("/search")}
        aria-label="Tìm kiếm"
      >
        <IoSearchOutline className="size-[22px]" />
      </Button>
      
      <div className="relative">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleThemeMenu();
          }}
          className="size-[34px] text-thirty hover:!text-primary"
          aria-haspopup="menu"
          aria-expanded={showThemeMenu}
          aria-label={`Theme: ${labelByMode[theme] || "System"}`}
          title={labelByMode[theme] || "System"}
        >
          <i className="text-[20px] pointer-events-none flex items-center justify-center">
            <ThemeIcon />
          </i>
        </Button>
        
        {showThemeMenu && (
          <div className="absolute right-0 top-[calc(100%+10px)] bg-bg-sidebar rounded-[6px] border border-solid border-bd-filed-form-color p-[6px] min-w-[168px] z-[5200] shadow-xl">
            {["system", "light", "dark"].map((mode) => {
              const ItemIcon = iconByMode[mode];
              return (
                <Button
                  key={mode}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTheme(mode);
                  }}
                  className={`w-full !justify-start gap-x-[10px] px-[10px] py-[8px] text-[13px] rounded-[4px] border-none ${
                    theme === mode
                      ? "bg-bg-menu-items text-primary"
                      : "text-secondary hover:!text-primary"
                  }`}
                  leftIcon={<ItemIcon />}
                >
                  <span className="pointer-events-none whitespace-nowrap">
                    {labelByMode[mode]}
                  </span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
      
      {isLoggedIn ? (
        <div className="relative">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMenu();
            }}
            rounded
            className="size-[35px]"
          >
            {avatar ? (
              <NextImage
                src={avatar}
                alt="avatar"
                className="rounded-[50%] object-cover"
                width={35}
                height={35}
              />
            ) : (
              <div className="rounded-[50%] size-full bg-white/20" />
            )}
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-[calc(100%+15px)] z-[5100]">
              <MenuUser
                data={userInfo}
                dataMenu={dataUserMenu}
                onClose={() => setShowMenu(false)}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <Button
            onClick={() => setShowLoginModal(true)}
            className="text-[14px] text-thirty"
          >
            Đăng nhập
          </Button>
          <LoginModal onClose={() => setShowLoginModal(false)} isShowModal={showLoginModal} />
        </>
      )}
    </div>
  );
}

export default RightHeader;
