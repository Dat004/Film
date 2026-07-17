import routes from '@/constants/routes';
import { PersonIcon, SettingsIcon, HeartIcon, HistoryIcon } from '@/icons';

export const dataMenu = [
  {
    title: 'Trang chủ',
    path: routes.home,
    type: 'link',
  },
  {
    title: 'Phim mới',
    path: routes.phim_moi,
    type: 'link',
  },
  {
    title: 'Phim lẻ',
    path: routes.phim_le,
    type: 'link',
  },
  {
    title: 'Phim bộ',
    path: routes.phim_bo,
    type: 'link',
  },
  {
    title: 'Phim hoạt hình',
    path: routes.phim_hoat_hinh,
    type: 'link',
  },
  {
    title: 'TV Show',
    path: routes.tv_show,
    type: 'link',
  },
] as const;

export const dataUserMenu = [
  {
    id: 1,
    path: routes.user_profile,
    Icon: PersonIcon,
    title: 'Cá nhân',
  },
  {
    id: 2,
    path: routes.continue_watching,
    Icon: HistoryIcon,
    title: 'Tiếp tục xem',
  },
  {
    id: 3,
    path: routes.watch_list,
    Icon: HeartIcon,
    title: 'Danh sách phát',
  },
  {
    id: 4,
    path: routes.user_setting,
    Icon: SettingsIcon,
    title: 'Cài đặt',
  },
] as const;
