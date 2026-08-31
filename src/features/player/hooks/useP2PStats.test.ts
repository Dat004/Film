import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useP2PStats } from './useP2PStats';

describe('useP2PStats', () => {
  it('starts with empty stats', () => {
    const { result } = renderHook(() => useP2PStats());
    expect(result.current.stats).toEqual({
      httpBytes: 0,
      p2pBytes: 0,
      peerCount: 0,
      p2pRatio: 0,
    });
  });

  it('accumulates bytes and calculates p2pRatio % correctly', () => {
    const { result } = renderHook(() => useP2PStats());

    act(() => {
      result.current.handleStatsUpdate({
        httpBytes: 2000,
        p2pBytes: 8000,
        peerCount: 3,
        p2pRatio: 0,
      });
    });

    expect(result.current.stats.httpBytes).toBe(2000);
    expect(result.current.stats.p2pBytes).toBe(8000);
    expect(result.current.stats.peerCount).toBe(3);
    expect(result.current.stats.p2pRatio).toBe(80);
  });

  it('resets stats back to initial state', () => {
    const { result } = renderHook(() => useP2PStats());

    act(() => {
      result.current.handleStatsUpdate({
        httpBytes: 5000,
        p2pBytes: 5000,
        peerCount: 2,
        p2pRatio: 0,
      });
    });

    act(() => {
      result.current.resetStats();
    });

    expect(result.current.stats).toEqual({
      httpBytes: 0,
      p2pBytes: 0,
      peerCount: 0,
      p2pRatio: 0,
    });
  });
});
