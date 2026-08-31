'use client';

import { useState, useCallback, useRef } from 'react';

import type { P2PStats } from '../lib/p2p-hls-config';

const EMPTY_STATS: P2PStats = { httpBytes: 0, p2pBytes: 0, peerCount: 0, p2pRatio: 0 };

// Hook theo dõi dung lượng HTTP vs P2P
export function useP2PStats() {
  const [stats, setStats] = useState<P2PStats>(EMPTY_STATS);
  const accRef = useRef({ httpBytes: 0, p2pBytes: 0 });

  const handleStatsUpdate = useCallback((update: P2PStats) => {
    accRef.current.httpBytes += update.httpBytes;
    accRef.current.p2pBytes += update.p2pBytes;
    const total = accRef.current.httpBytes + accRef.current.p2pBytes;

    setStats({
      httpBytes: accRef.current.httpBytes,
      p2pBytes: accRef.current.p2pBytes,
      peerCount: update.peerCount,
      p2pRatio: total > 0 ? Math.round((accRef.current.p2pBytes / total) * 100) : 0,
    });
  }, []);

  const resetStats = useCallback(() => {
    accRef.current = { httpBytes: 0, p2pBytes: 0 };
    setStats(EMPTY_STATS);
  }, []);

  return { stats, handleStatsUpdate, resetStats };
}
