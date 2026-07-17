import Link from 'next/link';

import { routes } from '@/constants/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-layout p-8 text-white">
      <div className="text-center">
        <h1 className="mb-2 text-8xl font-black text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Trang không tồn tại</h2>
        <p className="mb-8 max-w-md text-gray-400">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          href={routes.home}
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
