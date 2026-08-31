import type Hls from 'hls.js';
import type { HlsJsP2PEngine } from 'p2p-media-loader-hlsjs';
import { useEffect, useRef } from 'react';

import { logger } from '@/lib/logger';

import { HLS_MAIN_CONFIG } from '../constants/hls.constants';
import { PLAYER_UI_COPY } from '../constants/player-ui.constants';
import type { P2PStats } from '../lib/p2p-hls-config';
import {
  canPlayNativeHls,
  createHlsInstance,
  createHlsInstanceWithP2P,
  destroyHlsInstance,
  destroyP2PEngine,
  isHlsJsSupported,
  Hls as HlsClass,
} from '../services/hls.factory';

import type { NetworkAdaptiveConfig } from './useNetworkAdaptiveQuality';
import { getAdaptiveCapLevelIndex } from './useNetworkAdaptiveQuality';

export interface HlsQualityLevel {
  index: number;
  label: string;
  height: number;
}

export interface HlsQualityApi {
  levels: HlsQualityLevel[];
  setLevel: (index: number) => void;
  getCurrentLevel: () => number;
}

interface UseHlsPlayerOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  /** Bump to tear down & re-attach HLS without resetting playback time. */
  reloadKey?: number;
  adaptiveConfig?: NetworkAdaptiveConfig;
  p2pSwarmId?: string | undefined;
  onP2PStatsUpdate?: ((stats: P2PStats) => void) | undefined;
  onReady: () => void;
  onError: (message: string) => void;
  onTimeReset: () => void;
  onQualityReady?: (api: HlsQualityApi) => void;
}

export function useHlsPlayer({
  videoRef,
  src,
  reloadKey = 0,
  adaptiveConfig,
  p2pSwarmId,
  onP2PStatsUpdate,
  onReady,
  onError,
  onTimeReset,
  onQualityReady,
}: UseHlsPlayerOptions) {
  const prevSrcRef = useRef(src);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const p2pEngineRef = useRef<HlsJsP2PEngine | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return undefined;

    const srcChanged = prevSrcRef.current !== src;
    prevSrcRef.current = src;
    if (srcChanged) onTimeReset();

    let hls: Hls | null = null;
    let usedNativeHls = false;

    const onNativeLoadedMetadata = () => onReady();

    if (isHlsJsSupported()) {
      const dynamicConfig = {
        ...HLS_MAIN_CONFIG,
        ...(adaptiveConfig
          ? {
              maxBufferLength: adaptiveConfig.maxBufferLength,
              maxMaxBufferLength: adaptiveConfig.maxMaxBufferLength,
            }
          : {}),
      };

      // Dùng P2P loader trong watch-party
      if (p2pSwarmId) {
        const result = createHlsInstanceWithP2P(dynamicConfig, {
          swarmId: p2pSwarmId,
          onStatsUpdate: onP2PStatsUpdate,
        });
        hls = result.hls;
        p2pEngineRef.current = result.engine;
      } else {
        hls = createHlsInstance(dynamicConfig);
      }
      hlsInstanceRef.current = hls;
      hls.attachMedia(video);
      hls.loadSource(src);

      hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
        onReady();

        if (hls) {
          logger.info('[NetworkAdaptive] HLS Manifest parsed', {
            totalLevels: hls.levels.length,
            availableHeights: hls.levels.map((l) => l.height ?? 0),
          });

          if (adaptiveConfig?.capMaxHeight) {
            const rawLevels = hls.levels.map((l, idx) => ({ index: idx, height: l.height ?? 0 }));
            const capIdx = getAdaptiveCapLevelIndex(rawLevels, adaptiveConfig.capMaxHeight);
            if (capIdx !== -1) {
              hls.autoLevelCapping = capIdx;
            }
          }
        }

        if (onQualityReady && hls) {
          const levels: HlsQualityLevel[] = hls.levels
            .map((level, index) => ({
              index,
              label: level.height ? `${level.height}p` : `Nguồn ${index + 1}`,
              height: level.height ?? 0,
            }))
            .sort((a, b) => b.height - a.height);

          onQualityReady({
            levels,
            setLevel: (index: number) => {
              if (!hls) return;
              hls.currentLevel = index;
            },
            getCurrentLevel: () => hls?.currentLevel ?? -1,
          });
        }
      });

      hls.on(HlsClass.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case HlsClass.ErrorTypes.NETWORK_ERROR:
              onError(PLAYER_UI_COPY.errorNetwork);
              break;
            case HlsClass.ErrorTypes.MEDIA_ERROR:
              onError(PLAYER_UI_COPY.errorMedia);
              break;
            default:
              destroyHlsInstance(hls);
              hls = null;
              hlsInstanceRef.current = null;
              onError(PLAYER_UI_COPY.errorGeneric);
              break;
          }
        }
      });
    } else if (canPlayNativeHls(video)) {
      usedNativeHls = true;
      video.src = src;
      video.addEventListener('loadedmetadata', onNativeLoadedMetadata);
    } else {
      logger.error('Device does not support HLS playback');
      onError(PLAYER_UI_COPY.errorUnsupported);
    }

    return () => {
      if (usedNativeHls) {
        video.removeEventListener('loadedmetadata', onNativeLoadedMetadata);
        video.removeAttribute('src');
        video.load();
      }
      destroyP2PEngine(p2pEngineRef.current);
      p2pEngineRef.current = null;
      destroyHlsInstance(hls);
      hlsInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, reloadKey]);

  // Dynamically update active HLS buffer & level capping when network condition changes live
  useEffect(() => {
    const hls = hlsInstanceRef.current;
    if (!hls || !adaptiveConfig) return;

    hls.config.maxBufferLength = adaptiveConfig.maxBufferLength;
    hls.config.maxMaxBufferLength = adaptiveConfig.maxMaxBufferLength;

    if (hls.levels && hls.levels.length > 0) {
      const rawLevels = hls.levels.map((l, idx) => ({ index: idx, height: l.height ?? 0 }));
      if (adaptiveConfig.capMaxHeight) {
        const capIdx = getAdaptiveCapLevelIndex(rawLevels, adaptiveConfig.capMaxHeight);
        if (capIdx !== -1) {
          hls.autoLevelCapping = capIdx;
          logger.info('[NetworkAdaptive] Dynamic cap applied live', {
            capMaxHeight: adaptiveConfig.capMaxHeight,
            autoLevelCapping: capIdx,
          });
        }
      } else {
        hls.autoLevelCapping = -1; // Uncapped
      }
    }
  }, [adaptiveConfig]);
}
