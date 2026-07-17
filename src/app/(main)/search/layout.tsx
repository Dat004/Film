import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Tìm kiếm phim',
  description:
    'Với kho phim khổng lồ, rất nhiều bộ phim chưa được xem và đang được chờ bạn tìm kiếm. Hãy tìm kiếm bộ phim ưa thích của bạn và thưởng thức thôi nào',
};

export interface SearchLayoutProps {
  children: React.ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return <>{children}</>;
}
