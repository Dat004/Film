"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Menu from "@/components/ui/menu";

interface BarMenuProps {
  dataCategory?: any[];
  isShow?: boolean;
}

export function BarMenu({ dataCategory = [], isShow = false }: BarMenuProps) {
  const categoriesFilm = React.useMemo(() => {
    return (dataCategory[0] || []).map((item: any) => ({
      type: "link",
      ...item,
    }));
  }, [dataCategory]);

  const countriesCategoryFilm = React.useMemo(() => {
    return (dataCategory[1] || []).map((item: any) => ({
      type: "link",
      ...item,
    }));
  }, [dataCategory]);

  const data = React.useMemo(() => {
    return {
      type: "",
      path: "",
      items: [
        {
          name: "Trang chủ",
          slug: "/",
          type: "link",
        },
        {
          name: "Phim lẻ",
          slug: "/phim-le",
          type: "link",
        },
        {
          name: "Phim bộ",
          slug: "/phim-bo",
          type: "link",
        },
        {
          name: "Phim hoạt hình",
          slug: "/hoat-hinh",
          type: "link",
        },
        {
          name: "TV Show",
          slug: "/tv-shows",
          type: "link",
        },
        {
          name: "Thể loại",
          slug: "",
          isSubMenu: true,
          subMenu: {
            type: "categories",
            path: "/the-loai/",
            items: categoriesFilm,
          },
        },
        {
          name: "Quốc gia",
          slug: "",
          isSubMenu: true,
          subMenu: {
            type: "countries",
            path: "/quoc-gia/",
            items: countriesCategoryFilm,
          },
        },
      ],
    };
  }, [categoriesFilm, countriesCategoryFilm]);

  React.useEffect(() => {
    if (isShow) {
      document.body.classList.add("open-modal");
    } else {
      document.body.classList.remove("open-modal");
    }
    return () => {
      document.body.classList.remove("open-modal");
    };
  }, [isShow]);

  const variants = {
    hide: { x: "-100%" },
    show: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isShow && (
        <>
          <motion.div
            initial="hide"
            animate="show"
            exit="hide"
            variants={variants}
            transition={{
              duration: 0.4,
              type: "spring",
            }}
            className="fixed h-[100dvh] left-0 top-0 w-[250px] z-[9000] bg-bg-sidebar shadow-2xl"
          >
            <Menu className="!bg-bg-transparent h-full overflow-y-auto" darkMode dataMenu={data} />
          </motion.div>
          <div className="fixed top-0 left-0 h-[100dvh] w-[100dvw] bg-black/60 z-[8900]"></div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BarMenu;
