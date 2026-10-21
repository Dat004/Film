import type { PartialHlsConfig } from '../services/hls.factory';

/** Main player HLS buffer profile. */
export const HLS_MAIN_CONFIG: PartialHlsConfig = {
  maxBufferLength: 60,
  maxMaxBufferLength: 1200,
  backBufferLength: Infinity,
  frontBufferFlushThreshold: Infinity,
  maxBufferSize: 120 * 1000 * 1000,
  maxBufferHole: 0.1,
  // Fast failover retry policies to hand over control promptly to Self-Healing FSM
  fragLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 8000,
      maxLoadTimeMs: 10000,
      timeoutRetry: {
        maxNumRetry: 2,
        retryDelayMs: 500,
        maxRetryDelayMs: 2000,
      },
      errorRetry: {
        maxNumRetry: 2,
        retryDelayMs: 1000,
        maxRetryDelayMs: 2000,
      },
    },
  },
  manifestLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 8000,
      maxLoadTimeMs: 10000,
      timeoutRetry: {
        maxNumRetry: 2,
        retryDelayMs: 500,
        maxRetryDelayMs: 2000,
      },
      errorRetry: {
        maxNumRetry: 2,
        retryDelayMs: 1000,
        maxRetryDelayMs: 2000,
      },
    },
  },
};

/** Scrub-preview thumbnail HLS profile (lighter). */
export const HLS_PREVIEW_CONFIG: PartialHlsConfig = {
  enableWorker: true,
  lowLatencyMode: false,
  maxBufferLength: 8,
  maxMaxBufferLength: 12,
  maxBufferSize: 8 * 1000 * 1000,
};

export const HLS_PREVIEW_SEEK_DEBOUNCE_MS = 120;
export const HLS_PREVIEW_WIDTH = 320;
export const HLS_PREVIEW_HEIGHT = 180;
