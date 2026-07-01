import { PersonIcon, SettingsIcon, HeartIcon, HistoryIcon } from "../icons";

export interface MenuItem {
  title: string;
  path: string;
  type: string;
}

export interface UserMenuItem {
  id: number;
  path: string;
  Icon: any;
  title: string;
}

export const dataMenu: MenuItem[] = [
  {
    title: "Trang chủ",
    path: "/",
    type: "link",
  },
  {
    title: "Phim lẻ",
    path: "/phim-le",
    type: "link",
  },
  {
    title: "Phim bộ",
    path: "/phim-bo",
    type: "link",
  },
  {
    title: "Phim hoạt hình",
    path: "/hoat-hinh",
    type: "link",
  },
  {
    title: "TV Show",
    path: "/tv-shows",
    type: "link",
  },
];

export const dataUserMenu: UserMenuItem[] = [
  {
    id: 1,
    path: "/user/profile",
    Icon: PersonIcon,
    title: "Cá nhân",
  },
  {
    id: 2,
    path: "/user/continue-watching",
    Icon: HistoryIcon,
    title: "Tiếp tục xem",
  },
  {
    id: 3,
    path: "/user/watch-list",
    Icon: HeartIcon,
    title: "Danh sách phát",
  },
  {
    id: 4,
    path: "/user/settings",
    Icon: SettingsIcon,
    title: "Cài đặt",
  },
];
