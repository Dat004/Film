import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { FlexContainer, FlexItems } from "../../../../components/Flex";
import Container from "../../../../components/Container";
import Button from "../../../../components/Button";
import Image from "../../../../components/Image";
import { BarMenuIcon } from "../../../../icons";
import images from "../../../../assets/images";
import data from "../../../../data";
import MenuItems from "./MenuItems";

function LeftHeader({ dataCategory = [] }) {
  const [isShowMenu, setIsShowMenu] = useState(false);
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isShowMenu]);

  const handleClickOutside = () => {
    if (isShowMenu) setIsShowMenu(false);
  };

  const handleShowMenu = (e) => {
    e.stopPropagation();

    setIsShowMenu(true);
  };

  return (
    <>
      {!!dataCategory && (
        <MenuItems dataCategory={dataCategory} isShow={isShowMenu} />
      )}
      <div className="flex items-center">
        <Button onClick={handleShowMenu} className="hidden lgm:block mr-[15px]">
          <BarMenuIcon width="24px" height="24px" />
        </Button>
        <Link className="mr-[25px]" to="/">
          <div className="w-[125px]">
            <Image src={images.logo} alt="logo" />
          </div>
        </Link>
        <nav className="flex items-center lgm:hidden">
          {data.dataMenu.map((items, index) => (
            <NavLink
              className={`${
                pathname === items.path ? "text-primary" : "text-secondary"
              } p-[12px] hover:text-primary cursor-pointer`}
              to={items.path}
              key={index}
            >
              <span className="text-[16px] font-medium">{items.title}</span>
            </NavLink>
          ))}
          {!!dataCategory?.length && (
            <ul className="flex items-center">
              <li
                className={`${
                  pathname?.split("/")[1] === "the-loai"
                    ? "text-primary"
                    : "text-secondary"
                } relative group/table p-[12px] flex items-center hover:text-primary cursor-pointer`}
              >
                <span className="text-[16px] font-medium">Thể loại</span>
                <div className="hidden group-hover/table:block absolute left-0 xlm:left-[calc(0%-50px)] top-[100%] cursor-default">
                  <Container className="w-[540px] xlm:w-[350px] p-[12px] max-h-[450px]">
                    <FlexContainer className="!gap-y-0" isWrap>
                      {dataCategory[0]?.map((item) => (
                        <FlexItems
                          className="separator-item flex-shrink-0 w-[25%] xlm:w-[calc(100%/3)]"
                          key={item?._id}
                        >
                          <p className="text-[14px] font-normal">
                            <Link
                              className="text-secondary hover:text-primary px-[12px] w-[100%] block"
                              to={`/the-loai/${item?.slug}`}
                            >
                              {item?.name}
                            </Link>
                          </p>
                        </FlexItems>
                      ))}
                    </FlexContainer>
                  </Container>
                </div>
              </li>
              <li
                className={`${
                  pathname?.split("/")[1] === "quoc-gia"
                    ? "text-primary"
                    : "text-secondary"
                } relative group/table p-[12px] flex items-center hover:text-primary cursor-pointer`}
              >
                <span className="text-[16px] font-medium">Quốc gia</span>
                <div className="hidden group-hover/table:block absolute left-[calc(0%-81px)] xlm:left-[calc(-20%-114px)] top-[100%] cursor-default">
                  <Container className="w-[540px] xlm:w-[350px] p-[12px] max-h-[450px] overflow-auto">
                    <FlexContainer className="!gap-y-0" isWrap>
                      {dataCategory[1]?.map((item) => (
                        <FlexItems
                          className="separator-item flex-shrink-0 w-[25%] xlm:w-[calc(100%/3)]"
                          key={item?._id}
                        >
                          <p className="text-[14px] font-normal">
                            <Link
                              className="text-secondary hover:text-primary px-[12px] w-[100%] block"
                              to={`/quoc-gia/${item?.slug}`}
                            >
                              {item?.name}
                            </Link>
                          </p>
                        </FlexItems>
                      ))}
                    </FlexContainer>
                  </Container>
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
