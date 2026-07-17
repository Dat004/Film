import type { HlsConfig } from 'hls.js';
import Hls from 'hls.js';

export type PartialHlsConfig = Partial<HlsConfig>;

export function createHlsInstance(config: PartialHlsConfig): Hls {
  return new Hls(config);
}

export function destroyHlsInstance(hls: Hls | null | undefined): void {
  if (!hls) return;
  try {
    hls.detachMedia();
  } catch {
    /* ignore */
  }
  hls.destroy();
}

export function isHlsJsSupported(): boolean {
  return Hls.isSupported();
}

export function canPlayNativeHls(video: HTMLVideoElement): boolean {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
}

export { Hls };
