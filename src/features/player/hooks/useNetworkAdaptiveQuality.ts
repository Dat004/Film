import { useEffect, useState, useCallback } from 'react';

import { logger } from '@/lib/logger';

export type NetworkEffectiveType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';

export interface NetworkAdaptiveConfig {
  effectiveType: NetworkEffectiveType;
  saveData: boolean;
  downlink: number; // Mbps
  rtt: number; // ms
  maxBufferLength: number;
  maxMaxBufferLength: number;
  capMaxHeight: number | null; // e.g. 720, 480, or null for uncapped
  isDataSaver: boolean;
}

export interface NetworkInformationApi extends EventTarget {
  effectiveType?: NetworkEffectiveType;
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

export const DEFAULT_NETWORK_CONFIG: NetworkAdaptiveConfig = {
  effectiveType: '4g',
  saveData: false,
  downlink: 10,
  rtt: 50,
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
  capMaxHeight: null,
  isDataSaver: false,
};

/**
 * Calculates adaptive buffer length and max resolution cap based on network parameters.
 */
export function calculateAdaptiveConfig(
  effectiveType: NetworkEffectiveType = '4g',
  saveData = false,
  downlink = 10,
  rtt = 50
): NetworkAdaptiveConfig {
  // Poor network: 2g / slow-2g / Data Saver mode or downlink < 1 Mbps
  if (saveData || effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 1.0) {
    return {
      effectiveType,
      saveData,
      downlink,
      rtt,
      maxBufferLength: 5,
      maxMaxBufferLength: 10,
      capMaxHeight: 480,
      isDataSaver: true,
    };
  }

  // Medium network: 3g or downlink 1.0 - 3.5 Mbps
  if (effectiveType === '3g' || downlink < 3.5 || rtt > 300) {
    return {
      effectiveType,
      saveData,
      downlink,
      rtt,
      maxBufferLength: 15,
      maxMaxBufferLength: 30,
      capMaxHeight: 720,
      isDataSaver: false,
    };
  }

  // High quality network: 4g / 5g / Broadband
  return {
    effectiveType,
    saveData,
    downlink,
    rtt,
    maxBufferLength: 30,
    maxMaxBufferLength: 60,
    capMaxHeight: null,
    isDataSaver: false,
  };
}

/**
 * Finds the max level index in HLS levels array matching the height cap.
 */
export function getAdaptiveCapLevelIndex(
  levels: { index: number; height: number }[],
  capMaxHeight: number | null
): number {
  if (!capMaxHeight || levels.length === 0) return -1;

  const valid = levels.filter((l) => l.height <= capMaxHeight);
  if (valid.length === 0) {
    const lowest = [...levels].sort((a, b) => a.height - b.height)[0];
    return lowest ? lowest.index : -1;
  }

  const highestValid = [...valid].sort((a, b) => b.height - a.height)[0];
  return highestValid ? highestValid.index : -1;
}

export function useNetworkAdaptiveQuality() {
  const [config, setConfig] = useState<NetworkAdaptiveConfig>(DEFAULT_NETWORK_CONFIG);

  const updateNetworkInfo = useCallback(() => {
    if (typeof window === 'undefined' || !('navigator' in window)) return;

    const nav = navigator as Navigator & { connection?: NetworkInformationApi };
    const conn = nav.connection;

    if (!conn) {
      setConfig(DEFAULT_NETWORK_CONFIG);
      return;
    }

    const newConfig = calculateAdaptiveConfig(
      conn.effectiveType || '4g',
      Boolean(conn.saveData),
      conn.downlink || 10,
      conn.rtt || 50
    );

    setConfig(newConfig);
    logger.info('[NetworkAdaptive] Connection updated', { newConfig });
  }, []);

  useEffect(() => {
    updateNetworkInfo();

    if (typeof window === 'undefined') return undefined;
    const nav = navigator as Navigator & { connection?: NetworkInformationApi };
    const conn = nav.connection;

    if (conn) {
      conn.addEventListener('change', updateNetworkInfo);
      return () => {
        conn.removeEventListener('change', updateNetworkInfo);
      };
    }
    return undefined;
  }, [updateNetworkInfo]);

  return config;
}
