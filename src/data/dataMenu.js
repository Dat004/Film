import router from "../router";

const dataMenu = [
  {
    title: "Trang chủ",
    path: router.home,
    type: "link",
  },
  {
    title: "Phim lẻ",
    path: router.phim_le,
    type: "link",
  },
  {
    title: "Phim bộ",
    path: router.phim_bo,
    type: "link",
  },
  {
    title: "Phim hoạt hình",
    path: router.phim_hoat_hinh,
    type: "link",
  },
  {
    title: "TV Show",
    path: router.tv_show,
    type: "link",
  },
];

export default dataMenu;
