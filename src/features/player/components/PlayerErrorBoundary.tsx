'use client';

import React, { Component, type ReactNode } from 'react';

import { PlayDisabled } from '@/icons';
import { logger } from '@/lib/logger';

export interface PlayerErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: unknown[];
}

interface PlayerErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Aspect-ratio 16:9 contextual Error Boundary tailored for the Video Player.
 * Catches runtime crashes inside Video player components without breaking
 * the surrounding layout (details, episode lists, comments).
 */
export class PlayerErrorBoundary extends Component<
  PlayerErrorBoundaryProps,
  PlayerErrorBoundaryState
> {
  state: PlayerErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): PlayerErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[PlayerErrorBoundary] Caught player crash', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  componentDidUpdate(prevProps: PlayerErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some((key, idx) => key !== prevProps.resetKeys![idx]);
      if (hasChanged) {
        this.handleReset();
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="absolute inset-0 z-[1000] flex cursor-default flex-col items-center justify-center bg-bg-layout-loading px-4 text-center select-none"
        >
          <div className="flex max-w-[85%] flex-col items-center justify-center gap-y-3">
            <div className="size-[64px] text-primary detail769:size-[80px] opacity-80">
              <PlayDisabled />
            </div>
            <h3 className="text-sm font-semibold text-primary detail769:text-base">
              Trình phát gặp sự cố hiển thị
            </h3>
            <p className="max-w-md text-xs text-secondary line-clamp-2">
              {this.state.error?.message || 'Đã có lỗi bất ngờ xảy ra khi xử lý giao diện video.'}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white px-4 text-xs font-semibold text-black transition-opacity hover:opacity-90 active:opacity-80 cursor-pointer"
              >
                Thử tải lại player
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-4 text-xs font-medium text-white transition-colors hover:bg-white/10 cursor-pointer"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlayerErrorBoundary;
