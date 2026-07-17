import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Top Phim Lẻ - Phim Hành Động Võ Thuật Hay Mới Nhất 2024',
  description:
    'Kho phim lẻ Hồng Kông, Hàn Quốc, Âu Mỹ, Việt Nam, Trung Quốc hay mới nhất 2024 chỉ có tại website của chúng tôi. Xem ngay.',
};

export interface PhimLeLayoutProps {
  children: React.ReactNode;
}

export default function PhimLeLayout({ children }: PhimLeLayoutProps) {
  return <>{children}</>;
}
