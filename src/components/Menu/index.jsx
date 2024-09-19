import { useState, Fragment } from "react";
import { IoChevronBack } from "react-icons/io5";
import { NavLink, useLocation } from "react-router-dom";
import { IoChevronForwardOutline } from "react-icons/io5";
import classNames from "classnames";

import Container from "../Container";
import Button from "../Button";

function Menu({
  dataMenu = {},
  className,
  darkMode = false,
  onClick = () => {},
}) {
  const { pathname } = useLocation();
  const [menu, setMenu] = useState([
    {
      ...dataMenu,
    },
  ]);

  let Comp = "li";
  const finalMenu = menu[menu.length - 1];

  const menuClasses = classNames("min-w-[140px]", {
    [className]: className,
    "bg-bg-white": !darkMode,
  });

  const handleChangeMenu = (e, item) => {
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
    <Fragment>
      <Container className={menuClasses}>
        <Fragment>
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
              let props = {};
              const path = finalMenu.path
                ? finalMenu.path + item?.slug
                : item?.slug;

              if (item?.type === "link") {
                Comp = NavLink;
                props.to = path;
              } else {
                Comp = "li";
              }

              return (
                <Comp
                  key={index}
                  className="relative flex items-center px-[12px] w-[100%] h-[36px] !justify-start py-[10px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer"
                  onClick={(e) => handleChangeMenu(e, item)}
                  {...props}
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
                    <i
                      className={`${
                        darkMode ? "text-items" : "text-dark"
                      } ml-auto`}
                    >
                      <IoChevronForwardOutline />
                    </i>
                  )}
                </Comp>
              );
            })}
          </ul>
        </Fragment>
      </Container>
    </Fragment>
  );
}

export default Menu;
