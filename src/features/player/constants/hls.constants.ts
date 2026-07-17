import type { PartialHlsConfig } from '../services/hls.factory';

/** Main player HLS buffer profile. */
export const HLS_MAIN_CONFIG: PartialHlsConfig = {
  maxBufferLength: 60,
  maxMaxBufferLength: 1200,
  backBufferLength: Infinity,
  frontBufferFlushThreshold: Infinity,
  maxBufferSize: 120 * 1000 * 1000,
  maxBufferHole: 0.1,
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
