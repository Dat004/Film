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

export type PlayerRecoveryState =
  'idle' | 'recovering_media' | 'recovering_network' | 'fallback_cdn' | 'fatal_error';

export interface PlayerRecoveryStatus {
  state: PlayerRecoveryState;
  attempt?: number;
  maxAttempts?: number;
  message?: string;
  timestamp: number;
}

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

export interface UseHlsPlayerOptions {
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
  /** Self-healing state observer for diagnostic HUD and UI banners. */
  onRecoveryStateChange?: ((status: PlayerRecoveryStatus) => void) | undefined;
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
  onRecoveryStateChange,
}: UseHlsPlayerOptions) {
  const prevSrcRef = useRef(src);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const p2pEngineRef = useRef<HlsJsP2PEngine | null>(null);

  // Self-Healing FSM counters & timers
  const mediaRecoveryCountRef = useRef(0);
  const networkRetryCountRef = useRef(0);
  const networkRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeP2PRef = useRef(Boolean(p2pSwarmId));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return undefined;

    const srcChanged = prevSrcRef.current !== src;
    prevSrcRef.current = src;
    if (srcChanged) onTimeReset();

    // Reset recovery attempts on new source or manual reload
    mediaRecoveryCountRef.current = 0;
    networkRetryCountRef.current = 0;
    activeP2PRef.current = Boolean(p2pSwarmId);
    if (networkRetryTimerRef.current) {
      clearTimeout(networkRetryTimerRef.current);
      networkRetryTimerRef.current = null;
    }

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

      // Dùng P2P loader trong watch-party nếu được kích hoạt
      if (activeP2PRef.current && p2pSwarmId) {
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
        // Reset recovery state to idle on successful parse
        mediaRecoveryCountRef.current = 0;
        networkRetryCountRef.current = 0;
        onRecoveryStateChange?.({
          state: 'idle',
          timestamp: Date.now(),
        });

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

      // Clear transient retry counts when segments buffer successfully
      hls.on(HlsClass.Events.FRAG_BUFFERED, () => {
        mediaRecoveryCountRef.current = 0;
        networkRetryCountRef.current = 0;
      });

      // 4-Tier Self-Healing FSM Error Handler
      hls.on(HlsClass.Events.ERROR, (_event, data) => {
        if (!data.fatal) {
          logger.warn('[SelfHealing] Non-fatal HLS warning/error', {
            type: data.type,
            details: data.details,
          });

          // Proactively detect buffer stall or fragment load error when offline
          if (
            typeof navigator !== 'undefined' &&
            !navigator.onLine &&
            (data.details === 'bufferStalledError' ||
              data.details === 'fragLoadError' ||
              data.type === HlsClass.ErrorTypes.NETWORK_ERROR)
          ) {
            onRecoveryStateChange?.({
              state: 'recovering_network',
              attempt: 1,
              maxAttempts: 3,
              message: 'Mất kết nối · Đang tự động kết nối lại...',
              timestamp: Date.now(),
            });
          }
          return;
        }

        logger.error('[SelfHealing] Fatal HLS error encountered', undefined, {
          type: data.type,
          details: data.details,
          currentTime: video.currentTime,
        });

        // ── TIER 1: Media Error Recovery (decode buffer desync, codec glitch) ──
        if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
          if (mediaRecoveryCountRef.current < 2) {
            mediaRecoveryCountRef.current += 1;
            onRecoveryStateChange?.({
              state: 'recovering_media',
              attempt: mediaRecoveryCountRef.current,
              maxAttempts: 2,
              message: 'Đang khôi phục luồng phát...',
              timestamp: Date.now(),
            });
            logger.info('[SelfHealing] Tier 1: Executing hls.recoverMediaError', {
              attempt: mediaRecoveryCountRef.current,
            });
            hls?.recoverMediaError();
            return;
          }
          if (mediaRecoveryCountRef.current === 2) {
            mediaRecoveryCountRef.current += 1;
            onRecoveryStateChange?.({
              state: 'recovering_media',
              attempt: mediaRecoveryCountRef.current,
              maxAttempts: 2,
              message: 'Đang khôi phục âm thanh và hình ảnh...',
              timestamp: Date.now(),
            });
            hls?.swapAudioCodec();
            hls?.recoverMediaError();
            return;
          }
        }

        // ── TIER 2: Network Error Recovery with Exponential Backoff ──
        if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
          if (networkRetryCountRef.current < 3) {
            networkRetryCountRef.current += 1;
            const backoffMs = Math.min(1000 * Math.pow(2, networkRetryCountRef.current - 1), 4000);
            onRecoveryStateChange?.({
              state: 'recovering_network',
              attempt: networkRetryCountRef.current,
              maxAttempts: 3,
              message: `Đang kết nối lại (${networkRetryCountRef.current}/3)...`,
              timestamp: Date.now(),
            });
            logger.info('[SelfHealing] Tier 2: Scheduling hls.startLoad with backoff', {
              attempt: networkRetryCountRef.current,
              backoffMs,
            });
            if (networkRetryTimerRef.current) clearTimeout(networkRetryTimerRef.current);
            networkRetryTimerRef.current = setTimeout(() => {
              if (hlsInstanceRef.current) {
                hlsInstanceRef.current.startLoad();
              }
            }, backoffMs);
            return;
          }
        }

        // ── TIER 3: P2P Mesh Fallback to Pure CDN Mode ──
        if (activeP2PRef.current && p2pEngineRef.current) {
          logger.warn('[SelfHealing] Tier 3: P2P Swarm disrupted, falling back to pure CDN mode');
          activeP2PRef.current = false;
          onRecoveryStateChange?.({
            state: 'fallback_cdn',
            message: 'Đang chuyển sang nguồn phát dự phòng...',
            timestamp: Date.now(),
          });

          const savedPosition = video.currentTime;
          destroyP2PEngine(p2pEngineRef.current);
          p2pEngineRef.current = null;
          destroyHlsInstance(hls);
          hls = null;
          hlsInstanceRef.current = null;

          // Re-instantiate standard HLS without P2P engine
          const cdnHls = createHlsInstance(dynamicConfig);
          hlsInstanceRef.current = cdnHls;
          cdnHls.attachMedia(video);
          cdnHls.loadSource(src);

          cdnHls.once(HlsClass.Events.MANIFEST_PARSED, () => {
            if (savedPosition > 0) {
              try {
                video.currentTime = savedPosition;
              } catch {
                /* ignore */
              }
            }
            onReady();
            onRecoveryStateChange?.({
              state: 'idle',
              timestamp: Date.now(),
            });
          });
          return;
        }

        // ── TIER 4: Unrecoverable Fatal Error ──
        logger.error('[SelfHealing] Tier 4: All self-healing recovery tiers exhausted');
        onRecoveryStateChange?.({
          state: 'fatal_error',
          message: PLAYER_UI_COPY.errorGeneric,
          timestamp: Date.now(),
        });

        destroyHlsInstance(hls);
        hls = null;
        hlsInstanceRef.current = null;

        if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
          onError(PLAYER_UI_COPY.errorNetwork);
        } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
          onError(PLAYER_UI_COPY.errorMedia);
        } else {
          onError(PLAYER_UI_COPY.errorGeneric);
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

    const onVideoWaiting = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        onRecoveryStateChange?.({
          state: 'recovering_network',
          attempt: 1,
          maxAttempts: 3,
          message: 'Mất kết nối · Đang tự động kết nối lại...',
          timestamp: Date.now(),
        });
      }
    };

    const onVideoPlaying = () => {
      onRecoveryStateChange?.({
        state: 'idle',
        timestamp: Date.now(),
      });
    };

    const handleWindowOffline = () => {
      logger.warn('[SelfHealing] Browser went offline');
      onRecoveryStateChange?.({
        state: 'recovering_network',
        attempt: 1,
        maxAttempts: 3,
        message: 'Mất kết nối · Đang tự động kết nối lại...',
        timestamp: Date.now(),
      });
    };

    const handleWindowOnline = () => {
      logger.info('[SelfHealing] Browser back online, resuming stream');
      onRecoveryStateChange?.({
        state: 'recovering_network',
        attempt: 1,
        maxAttempts: 3,
        message: 'Đã có kết nối mạng, đang nạp luồng video...',
        timestamp: Date.now(),
      });
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.startLoad();
      }
    };

    video.addEventListener('waiting', onVideoWaiting);
    video.addEventListener('playing', onVideoPlaying);

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', handleWindowOffline);
      window.addEventListener('online', handleWindowOnline);
    }

    return () => {
      video.removeEventListener('waiting', onVideoWaiting);
      video.removeEventListener('playing', onVideoPlaying);
      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleWindowOffline);
        window.removeEventListener('online', handleWindowOnline);
      }
      if (networkRetryTimerRef.current) {
        clearTimeout(networkRetryTimerRef.current);
        networkRetryTimerRef.current = null;
      }
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
