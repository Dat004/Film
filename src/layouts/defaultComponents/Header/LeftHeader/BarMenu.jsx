import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Menu from "../../../../components/Menu";
import router from "../../../../router";

function BarMenu({ dataCategory = [], isShow = false }) {
  const categoriesFilm = dataCategory[0]?.map((item) => ({
    type: "link",
    ...item,
  }));
  const countriesCategoryFilm = dataCategory[1]?.map((item) => ({
    type: "link",
    ...item,
  }));
  const data = {
    type: "",
    path: "",
    items: [
      {
        name: "Trang chủ",
        slug: router.home,
        type: "link",
      },
      {
        name: "Phim lẻ",
        slug: router.phim_le,
        type: "link",
      },
      {
        name: "Phim bộ",
        slug: router.phim_bo,
        type: "link",
      },
      {
        name: "Phim hoạt hình",
        slug: router.phim_hoat_hinh,
        type: "link",
      },
      {
        name: "TV Show",
        slug: router.tv_show,
        type: "link",
      },
      {
        name: "Thể loại",
        slug: "",
        isSubMenu: true,
        subMenu: {
          type: "categories",
          path: "/the-loai/",
          items: [...categoriesFilm],
        },
      },
      {
        name: "Quốc gia",
        slug: "",
        isSubMenu: true,
        subMenu: {
          type: "countries",
          path: "/quoc-gia/",
          items: [...countriesCategoryFilm],
        },
      },
    ],
  };

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
            className="fixed h-[100dvh] left-0 top-0 w-[250px] z-10 bg-bg-sidebar"
          >
            <Menu className="!bg-bg-transparent" darkMode dataMenu={data} />
          </motion.div>
          <div className="fixed top-0 left-0 h-[100dvh] w-[100dvw] bg-bg-sidebar z-[-1] opacity-50"></div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BarMenu;
