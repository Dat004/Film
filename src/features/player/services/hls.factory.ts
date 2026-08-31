import type { HlsConfig } from 'hls.js';
import Hls from 'hls.js';
import { HlsJsP2PEngine } from 'p2p-media-loader-hlsjs';

import type { P2PHlsOptions } from '../lib/p2p-hls-config';
import { createP2PEngineConfig, isP2PSupported, destroyP2PEngine } from '../lib/p2p-hls-config';

export type PartialHlsConfig = Partial<HlsConfig>;

export function createHlsInstance(config: PartialHlsConfig): Hls {
  return new Hls(config);
}

// Create HLS instance with P2P engine attached
export function createHlsInstanceWithP2P(
  config: PartialHlsConfig,
  p2pOptions: P2PHlsOptions
): { hls: Hls; engine: HlsJsP2PEngine | null } {
  if (!isP2PSupported()) {
    return { hls: new Hls(config), engine: null };
  }

  const engine = new HlsJsP2PEngine(createP2PEngineConfig(p2pOptions));
  const p2pConfig = engine.getConfigForHlsJs() as Partial<HlsConfig>;
  const hls = new Hls({
    ...config,
    ...p2pConfig,
  });
  engine.bindHls(hls);

  let peerCount = 0;

  engine.addEventListener('onPeerConnect', () => {
    peerCount += 1;
  });

  engine.addEventListener('onPeerClose', () => {
    peerCount = Math.max(0, peerCount - 1);
  });

  engine.addEventListener('onSegmentLoaded', (params) => {
    const isP2P = params.downloadSource === 'p2p';
    p2pOptions.onStatsUpdate?.({
      httpBytes: isP2P ? 0 : params.bytesLength,
      p2pBytes: isP2P ? params.bytesLength : 0,
      peerCount,
      p2pRatio: 0,
    });
  });

  return { hls, engine };
}

export function destroyHlsInstance(hls: Hls | null | undefined): void {
  if (!hls) return;
  try {
    hls.detachMedia();
  } catch {
    // Ignore error
  }
  hls.destroy();
}

export function isHlsJsSupported(): boolean {
  return Hls.isSupported();
}

export function canPlayNativeHls(video: HTMLVideoElement): boolean {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
}

export { Hls, destroyP2PEngine };
