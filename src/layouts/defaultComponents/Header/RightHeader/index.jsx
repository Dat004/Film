import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginModal from "../../../../components/Modal/LoginModal";
import { UserAuth } from "../../../../context/AuthContext";
import { useTheme } from "../../../../context/ThemeContext";
import { useControlModal } from "../../../../hooks";
import Button from "../../../../components/Button";
import Image from "../../../../components/Image";
import data from "../../../../data";
import MenuUser from "./MenuUser";
import { IoSearchOutline } from "react-icons/io5";
import {
  MdOutlineBrightnessAuto,
  MdOutlineDarkMode,
  MdOutlineLightMode,
} from "react-icons/md";

const labelByMode = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const iconByMode = {
  system: MdOutlineBrightnessAuto,
  light: MdOutlineLightMode,
  dark: MdOutlineDarkMode,
};

function RightHeader() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    window.addEventListener("click", handleCloseMenu);

    return () => {
      window.removeEventListener("click", handleCloseMenu);
    };
  }, [showMenu, showThemeMenu]);

  const { dataUserMenu } = data;
  const { lg, uf, avatar } = UserAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { isShowModal, handleToggleModal, handleCloseModal } =
    useControlModal();

  const handleCloseMenu = () => {
    setShowMenu(false);
    setShowThemeMenu(false);
  };

  const handleToggleMenu = () => {
    setShowMenu((state) => !state);
  };

  const handleToggleThemeMenu = () => {
    setShowThemeMenu((state) => !state);
  };

  const handleSelectTheme = (mode) => {
    setThemeMode(mode);
    setShowThemeMenu(false);
  };

  const ThemeIcon = iconByMode[themeMode];

  return (
    <div className="flex items-center gap-[16px]">
      <Button
        className="size-[22px] text-primary"
        onClick={() => navigate("/search")}
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
          aria-label={`Theme: ${labelByMode[themeMode]}`}
          title={labelByMode[themeMode]}
        >
          <i className="text-[20px] pointer-events-none">
            <ThemeIcon />
          </i>
        </Button>
        {showThemeMenu && (
          <div className="absolute right-0 top-[calc(100%+10px)] bg-bg-sidebar rounded-[6px] border border-solid border-bd-filed-form-color p-[6px] min-w-[168px] z-[520]">
            {["system", "light", "dark"].map((mode) => {
              const ItemIcon = iconByMode[mode];
              return (
                <Button
                  key={mode}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTheme(mode);
                  }}
                  className={`w-[100%] !justify-start gap-x-[10px] px-[10px] py-[8px] text-[13px] rounded-[4px] ${
                    themeMode === mode
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
      {lg ? (
        <div className="relative">
          <Button
            onClick={(e) => {
              e.stopPropagation();

              handleToggleMenu();
            }}
            rounded
            className="size-[35px]"
          >
            <Image src={avatar} className="rounded-[50%]" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-[calc(100%+15px)]">
              <MenuUser
                data={uf}
                dataMenu={dataUserMenu}
                onClose={handleCloseMenu}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <Button
            onClick={handleToggleModal}
            className="text-[14px] text-thirty"
          >
            Đăng nhập
          </Button>
          <LoginModal onClose={handleCloseModal} isShowModal={isShowModal} />
        </>
      )}
    </div>
  );
}

export default RightHeader;
