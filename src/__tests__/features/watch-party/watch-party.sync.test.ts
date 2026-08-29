import { describe, it, expect, vi, beforeEach } from 'vitest';

import { estimateHostTime } from '@/features/watch-party/hooks/useVideoSync';
import type { RoomStatus } from '@/features/watch-party/types/watch-party.types';

describe('Phase 1.1: Clock Drift Estimation & Sub-Second Sync', () => {
  const now = 1_000_000_000;

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(now);
  });

  describe('estimateHostTime', () => {
    it('returns base currentTime when isPlaying is false', () => {
      const status: RoomStatus = {
        isPlaying: false,
        currentTime: 42,
        currentEpisode: 0,
        updatedAt: now - 5000,
      };
      expect(estimateHostTime(status)).toBe(42);
    });

    it('returns base currentTime when updatedAt is missing', () => {
      const status: RoomStatus = {
        isPlaying: true,
        currentTime: 42,
        currentEpisode: 0,
      };
      expect(estimateHostTime(status)).toBe(42);
    });

    it('estimates host playback time correctly based on elapsed time and rate', () => {
      const status: RoomStatus = {
        isPlaying: true,
        currentTime: 100,
        currentEpisode: 0,
        playbackRate: 1.0,
        updatedAt: now - 3000, // 3 seconds ago
      };
      // base (100) + elapsed (3s) * rate (1.0) = 103
      expect(estimateHostTime(status)).toBe(103);
    });

    it('factors in playbackRate when estimating host time', () => {
      const status: RoomStatus = {
        isPlaying: true,
        currentTime: 100,
        currentEpisode: 0,
        playbackRate: 1.5,
        updatedAt: now - 2000, // 2 seconds ago
      };
      // base (100) + 2s * 1.5 = 103
      expect(estimateHostTime(status)).toBe(103);
    });

    it('caps elapsed time to 10 seconds maximum to prevent huge jumps', () => {
      const status: RoomStatus = {
        isPlaying: true,
        currentTime: 100,
        currentEpisode: 0,
        playbackRate: 1.0,
        updatedAt: now - 30000, // 30 seconds ago
      };
      // capped at 10 seconds -> 100 + 10 = 110
      expect(estimateHostTime(status)).toBe(110);
    });
  });

  describe('Proportional Playback Rate Controller Logic', () => {
    const KP = 0.1;
    const MIN_RATE = 0.9;
    const MAX_RATE = 1.1;

    function computeAdaptiveRate(hostRate: number, guestTime: number, hostTargetTime: number): number {
      const deltaT = guestTime - hostTargetTime; // >0 guest ahead, <0 guest behind
      const absDrift = Math.abs(deltaT);

      if (absDrift <= 0.1) return hostRate;
      if (absDrift > 2.0) return hostRate; // Hard seek trigger

      const targetRate = Math.min(Math.max(hostRate - KP * deltaT, MIN_RATE), MAX_RATE);
      return Math.round(targetRate * 100) / 100;
    }

    it('returns exact hostRate when drift is within deadzone (<= 0.1s)', () => {
      expect(computeAdaptiveRate(1.0, 100.05, 100.0)).toBe(1.0);
    });

    it('speeds up guest (rate > 1.0) when guest is behind host (-0.8s)', () => {
      // deltaT = 99.2 - 100.0 = -0.8 -> rate = 1.0 - 0.1*(-0.8) = 1.08
      expect(computeAdaptiveRate(1.0, 99.2, 100.0)).toBe(1.08);
    });

    it('slows down guest (rate < 1.0) when guest is ahead of host (+0.5s)', () => {
      // deltaT = 100.5 - 100.0 = 0.5 -> rate = 1.0 - 0.1*(0.5) = 0.95
      expect(computeAdaptiveRate(1.0, 100.5, 100.0)).toBe(0.95);
    });

    it('clamps speed up rate to MAX_RATE (1.10x) when guest is far behind (-1.8s)', () => {
      // deltaT = -1.8 -> rate = 1.0 - 0.1*(-1.8) = 1.18 -> clamped to 1.1
      expect(computeAdaptiveRate(1.0, 98.2, 100.0)).toBe(1.1);
    });

    it('clamps slow down rate to MIN_RATE (0.90x) when guest is far ahead (+1.8s)', () => {
      // deltaT = +1.8 -> rate = 1.0 - 0.1*(1.8) = 0.82 -> clamped to 0.9
      expect(computeAdaptiveRate(1.0, 101.8, 100.0)).toBe(0.9);
    });
  });
});
