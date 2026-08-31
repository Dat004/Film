import { describe, it, expect } from 'vitest';

import { createP2PEngineConfig, isP2PSupported } from '../lib/p2p-hls-config';

describe('p2p-hls-config', () => {
  it('isP2PSupported returns boolean without throwing', () => {
    const supported = isP2PSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('createP2PEngineConfig builds config with room swarmId', () => {
    const config = createP2PEngineConfig({ swarmId: 'room-123' });
    expect(config.core?.swarmId).toBe('room-123');
    expect(config.core?.simultaneousHttpDownloads).toBe(3);
    expect(config.core?.simultaneousP2PDownloads).toBe(5);
    expect(config.core?.announceTrackers?.length).toBeGreaterThan(0);
  });
});
