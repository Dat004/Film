import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";

import { FlexContainer, FlexItems } from "../../components/Flex";
import { UserAuth } from "../../context/AuthContext";
import Header from "../defaultComponents/Header";
import Footer from "../defaultComponents/Footer";
import data from "../../data";

function ProfileLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const itemsRef = useRef([]);
  const slideRef = useRef();

  const { lg, uf } = UserAuth();
  const { dataUserMenu } = data;

  useEffect(() => {
    if (!lg) navigate("/");
  }, [lg]);

  useEffect(() => {
    if (itemsRef.current.length > 0) {
      itemsRef.current.forEach((item, index) => {
        const active = JSON.parse(item.dataset.active);

        if (active) {
          handleSetTabIndex(index);
        }
      });
    }
  }, [pathname]);

  const handleSetTabIndex = (index) => {
    const isActivePage = JSON.parse(itemsRef.current[index].dataset.active);

    if (isActivePage) {
      const width = itemsRef.current[index].offsetWidth;
      const left = itemsRef.current[index].getBoundingClientRect().left;

      slideRef.current.style.width = width + "px";
      slideRef.current.style.left = left - 15 + "px";
    }
  };

  return (
    <div className="w-[100%]">
      <Header />
      <main className="min-h-[520px] mt-[80px] pb-[30px]">
        <section className="relative pt-[40px] mb-[30px] overflow-hidden">
          <div
            style={{ backgroundImage: `url(${uf.photoUrl})` }}
            className="absolute left-0 right-0 top-[-20px] bottom-[-20px] blur-[20px] opacity-40 bg-center bg-cover bg-no-repeat"
          ></div>
          <div className="relative px-[15px]">
            <h1 className="text-primary text-[30px] text-center mb-[15px] font-medium">
              Hi, {uf.displayName}
            </h1>
            <FlexContainer className="relative items-center justify-center">
              {dataUserMenu.map((item, index) => {
                const { Icon } = item;

                return (
                  <FlexItems key={item.id}>
                    <div
                      data-active={pathname === item.path ? true : false}
                      onClick={(e) => handleSetTabIndex(index)}
                      ref={(ref) => (itemsRef.current[index] = ref)}
                      className="mx-[15px]"
                    >
                      <NavLink
                        to={item.path}
                        className={`${
                          pathname === item.path
                            ? "text-primary"
                            : "text-secondary"
                        } hover:text-primary flex items-center py-[15px] px-[10px] leading-[1.25]`}
                      >
                        <i className="size-[15px] mdm:size-[20px]">
                          <Icon width="100%" height="100%" />
                        </i>
                        <span className="mdm:hidden text-[14px] ml-[6px]">
                          {item.title}
                        </span>
                      </NavLink>
                    </div>
                  </FlexItems>
                );
              })}
              <span
                ref={slideRef}
                className="absolute h-px bg-bg-white bottom-0 transition-all duration-300"
              ></span>
            </FlexContainer>
          </div>
        </section>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default ProfileLayout;
