import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import './globals.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import GlobalUI from '@/components/ui/GlobalUI';
import RouteNavigationFeedback from '@/components/ui/RouteNavigationFeedback';
import Providers from '@/providers';

export const metadata: Metadata = {
  title: 'Xem Không Giới Hạn Phim, Show, Anime, TV, Thể Thao',
  description:
    'Chào mừng bạn đến với web xem phim của tôi, điểm đến tuyệt vời dành cho những người yêu thích phim ảnh! Tại đây, bạn có thể khám phá một kho tàng phim đa dạng từ khắp nơi trên thế giới, từ những bộ phim bom tấn Hollywood cho đến những tác phẩm điện ảnh độc lập đầy ấn tượng.',
  keywords:
    'anime to watch, watch anime, xem anime, web anime, xem hoạt hình, anime tiếng Việt, anime online, vietsub anime, vietsub dubbed anime',
  authors: [{ name: 'CụDat204' }],
  referrer: 'no-referrer-when-downgrade',
  robots: 'index,follow',
  verification: {
    google: '6nnILhBekgH6J8UikTfu1brwtRt1WZuH8f7VstvAkTQ',
  },
  icons: {
    icon: '/icon.jpg',
  },
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <Providers>
            <div className="bg-bg-layout">{children}</div>
            <Suspense fallback={null}>
              <RouteNavigationFeedback />
            </Suspense>
            <GlobalUI />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
