export interface ShortcutItem {
  keys: string[];
  label: string;
}

export interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

export const KEYBOARD_SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Điều khiển phát & Hiển thị',
    items: [
      { keys: ['Space', 'K'], label: 'Phát / Tạm dừng' },
      { keys: ['F'], label: 'Bật / Thoát toàn màn hình' },
      { keys: ['M'], label: 'Tắt / Bật âm thanh' },
      { keys: ['?'], label: 'Mở hướng dẫn phím tắt' },
    ],
  },
  {
    title: 'Tua phim & Chuyển mốc thời gian',
    items: [
      { keys: ['J', 'L'], label: 'Tua lùi / tiến 10 giây' },
      { keys: ['←', '→'], label: 'Tua lùi / tiến 5 giây' },
      { keys: ['0', '9'], label: 'Nhảy trực tiếp tới 0% - 90% video' },
    ],
  },
  {
    title: 'Điều chỉnh Âm lượng',
    items: [{ keys: ['↑', '↓'], label: 'Tăng / Giảm 10% âm lượng' }],
  },
];
