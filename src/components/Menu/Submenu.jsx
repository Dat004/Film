import { useState, Fragment, useRef, useEffect } from "react";
import { IoChevronForwardOutline } from "react-icons/io5";
import classNames from "classnames";

import Container from "../Container";

function Submenu({ dataMenu = [], className, ...passProps }) {
  const submenuRef = useRef([]);
  const menuItemRef = useRef();
  const [submenusVisible, setSubmenusVisible] = useState({});
  const [position, setPosition] = useState({
    x: null,
    y: null,
  });

  const menuClasses = classNames(
    "!bg-bg-white max-w-[220px] !rounded-[2px] min-w-[140px]",
    {
      [className]: className,
    }
  );

  const handleChangeMenu = (e, itemIndex, subMenu) => {
    if (subMenu?.isSubMenu) {
      const rect = menuItemRef.current.getBoundingClientRect();
      const width = rect.width;
      const top = rect.bottom + rect.height - rect.bottom;
      const left =
        rect.right + window.scrollX + width >= window.innerWidth
          ? rect.right - width - rect.right - 2
          : rect.left + width - rect.left + 2;

      console.log(dataMenu.length - itemIndex);

      setPosition({ x: left, y: top });
      setSubmenusVisible((prev) => ({
        [itemIndex]: !prev[itemIndex],
      }));

      return;
    }

    setSubmenusVisible({});
  };

  return (
    <Fragment>
      <Container ref={submenuRef} className={menuClasses} {...passProps}>
        <ul>
          {dataMenu.map((item, index) => (
            <li
              key={index}
              ref={menuItemRef}
              className="relative w-[100%] h-[36px] bg-transparent hover:bg-bg-menu-items leading-[1] select-none cursor-pointer"
            >
              <p
                onClick={(e) => handleChangeMenu(e, index, item)}
                className="flex px-[12px] py-[10px] items-center"
              >
                <span className="text-[12px] text-dark font-medium">
                  {item.title}
                </span>
                {item.isSubMenu && (
                  <i className="ml-auto">
                    <IoChevronForwardOutline />
                  </i>
                )}
              </p>
              {submenusVisible[index] && item.subMenu && (
                <div
                  style={{ left: `${position.x}px`, top: `${position.y}px` }}
                  className="absolute"
                >
                  <Submenu dataMenu={item.subMenu} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Fragment>
  );
}

export default Submenu;
