'use client';

import { useEffect } from 'react';

import { logger } from '@/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error('Global Next.js error boundary triggered', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-layout p-8 text-white"
    >
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-bold text-red-500">Lỗi</h1>
        <h2 className="mb-4 text-2xl font-semibold">Đã xảy ra sự cố</h2>
        <p className="mb-8 max-w-md text-gray-400">
          {error.message || 'Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại.'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
