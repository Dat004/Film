'use client';

import { Component, type ReactNode } from 'react';

import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    logger.error('ErrorBoundary caught an unhandled error', error, {
      componentStack: error.stack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-layout text-white"
          >
            <h2 className="text-2xl font-bold">Đã có lỗi xảy ra</h2>
            <p className="text-gray-400">{this.state.error?.message}</p>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium hover:opacity-80"
              onClick={() => this.setState({ hasError: false })}
            >
              Thử lại
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
