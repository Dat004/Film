import type { HlsJsP2PEngine, PartialHlsJsP2PEngineConfig } from 'p2p-media-loader-hlsjs';

export interface P2PHlsOptions {
  swarmId: string;
  onStatsUpdate?: ((stats: P2PStats) => void) | undefined;
}

export interface P2PStats {
  httpBytes: number;
  p2pBytes: number;
  peerCount: number;
  p2pRatio: number;
}

const DEFAULT_TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
];

// Check browser WebRTC support
export function isP2PSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof RTCPeerConnection === 'undefined') return false;
  try {
    const pc = new RTCPeerConnection();
    const dc = pc.createDataChannel('test');
    dc.close();
    pc.close();
    return true;
  } catch {
    return false;
  }
}

// Global config for P2P engine
export function createP2PEngineConfig(options: P2PHlsOptions): PartialHlsJsP2PEngineConfig {
  return {
    core: {
      swarmId: options.swarmId,
      simultaneousHttpDownloads: 3,
      simultaneousP2PDownloads: 5,
      p2pNotReceivingBytesTimeoutMs: 4_000,
      announceTrackers: DEFAULT_TRACKERS,
    },
  };
}

export function destroyP2PEngine(engine: HlsJsP2PEngine | null): void {
  if (!engine) return;
  try {
    engine.destroy();
  } catch {
    // Ignore errors during destroy
  }
}
