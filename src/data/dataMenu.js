import { PersonIcon, SettingsIcon } from "../icons";
import router from "../router";

export const dataMenu = [
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

export const dataUserMenu = [
  {
    id: 1,
    path: router.user_profile,
    Icon: PersonIcon,
    title: "Cá nhân",
    // component: pages.Home,
    // layout: DefaultLayout,
  },
  {
    id: 2,
    path: router.user_setting,
    Icon: SettingsIcon,
    title: "Cài đặt",
    // component: pages.DetailsFilm,
    // layout: DetailFilmLayout,
  },
];
