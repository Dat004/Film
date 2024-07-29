import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

import { FlexContainer } from "../../../../components/Flex";
import Button from "../../../../components/Button";
import router from "../../../../router";
import data from "../../../../data";

function MenuItems({ dataCategory = [], isShow = false }) {
  const [history, setHistory] = useState([
    {
      data: {
        items: [
          {
            name: "Trang chủ",
            slug: router.home,
          },
          {
            name: "Phim lẻ",
            slug: router.phim_le,
          },
          {
            name: "Phim bộ",
            slug: router.phim_bo,
          },
          {
            name: "Phim hoạt hình",
            slug: router.phim_hoat_hinh,
          },
          {
            name: "TV Show",
            slug: router.tv_show,
          },
          {
            name: "Thể loại",
            slug: "",
            children: { type: "categories", items: [...dataCategory[0]] },
          },
          {
            name: "Quốc gia",
            slug: "",
            children: { type: "countries", items: [...dataCategory[1]] },
          },
        ],
      },
    },
  ]);
  const location = useLocation();
  const { pathname } = location;

  const finalMenu = history[history.length - 1];
  let path = "";

  switch (finalMenu.data?.type) {
    case "categories":
      path = "the-loai/";
      break;
    case "countries":
      path = "quoc-gia/";
      break;
    default:
      break;
  }

  useEffect(() => {
    if (isShow) {
      document.body.classList.add("open-modal");

      return;
    }

    document.body.classList.remove("open-modal");
  }, [isShow]);

  const variants = {
    hide: { x: "-100%" },
    show: { x: 0 },
  };

  const handleClick = (e, items) => {
    e.stopPropagation();

    if (!!items?.children) {
      setHistory((state) => [
        ...state,
        { data: { ...items?.children, items: items?.children.items } },
      ]);
    }
  };

  return (
    <AnimatePresence>
      {isShow && (
        <>
          <motion.div
            initial="hide"
            animate="show"
            exit="hide"
            onClick={handleClick}
            variants={variants}
            transition={{
              duration: 0.4,
              type: "spring",
            }}
            className="fixed h-[100dvh] left-0 top-0 w-[250px] z-10 bg-bg-sidebar"
          >
            {history.length > 1 && (
              <Button
                onClick={() =>
                  setHistory((state) =>
                    state.filter((_, index) => index !== state.length - 1)
                  )
                }
                className="py-[8px] px-[16px] gap-x-[8px] text-[14px]"
                leftIcon={<IoChevronBack className="text-[18px]" />}
              >
                Quay lại
              </Button>
            )}
            <nav className="w-[100%] h-full bg-bg-sidebar overflow-auto">
              {finalMenu.data.items.map((items, index) => {
                const Comp = items.slug ? NavLink : "li";
                const props = {};

                if (items.slug) {
                  props.to = path + items.slug;
                }

                return (
                  <Comp
                    key={index}
                    className={`${
                      pathname === items.slug
                        ? "text-hover bg-bg-menu-items"
                        : "text-items"
                    } block w-[100%] py-[8px] px-[16px] hover:text-hover hover:bg-bg-menu-items cursor-pointer`}
                    onClick={(e) => handleClick(e, items)}
                    {...props}
                  >
                    <span className="text-[14px] font-normal">
                      {items.name}
                    </span>
                  </Comp>
                );
              })}
            </nav>
          </motion.div>
          <div className="fixed top-0 left-0 h-[100dvh] w-[100dvw] bg-bg-sidebar z-[-1] opacity-50"></div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MenuItems;
