import { describe, it, expect } from 'vitest';

import {
  calculateAdaptiveConfig,
  getAdaptiveCapLevelIndex,
} from '@/features/player/hooks/useNetworkAdaptiveQuality';

describe('Phase 2.2: Network-Aware Adaptive Quality Manager', () => {
  describe('calculateAdaptiveConfig()', () => {
    it('returns high-speed config for 4g broadband connection', () => {
      const config = calculateAdaptiveConfig('4g', false, 10, 30);
      expect(config.maxBufferLength).toBe(30);
      expect(config.maxMaxBufferLength).toBe(60);
      expect(config.capMaxHeight).toBeNull();
      expect(config.isDataSaver).toBe(false);
    });

    it('caps resolution to 720p and reduces buffer to 15s for 3g network', () => {
      const config = calculateAdaptiveConfig('3g', false, 2.5, 200);
      expect(config.maxBufferLength).toBe(15);
      expect(config.maxMaxBufferLength).toBe(30);
      expect(config.capMaxHeight).toBe(720);
      expect(config.isDataSaver).toBe(false);
    });

    it('caps resolution to 480p and enables Data Saver mode for 2g or saveData', () => {
      const config = calculateAdaptiveConfig('2g', true, 0.4, 500);
      expect(config.maxBufferLength).toBe(5);
      expect(config.maxMaxBufferLength).toBe(10);
      expect(config.capMaxHeight).toBe(480);
      expect(config.isDataSaver).toBe(true);
    });
  });

  describe('getAdaptiveCapLevelIndex()', () => {
    const mockLevels = [
      { index: 0, height: 1080 },
      { index: 1, height: 720 },
      { index: 2, height: 480 },
      { index: 3, height: 360 },
    ];

    it('returns -1 for uncapped null height cap (Auto)', () => {
      const capIndex = getAdaptiveCapLevelIndex(mockLevels, null);
      expect(capIndex).toBe(-1);
    });

    it('finds 720p level index when cap is 720', () => {
      const capIndex = getAdaptiveCapLevelIndex(mockLevels, 720);
      expect(capIndex).toBe(1);
    });

    it('finds 480p level index when cap is 480', () => {
      const capIndex = getAdaptiveCapLevelIndex(mockLevels, 480);
      expect(capIndex).toBe(2);
    });
  });
});
