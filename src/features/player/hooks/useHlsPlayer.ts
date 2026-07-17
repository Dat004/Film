import type Hls from 'hls.js';
import { useEffect, useRef } from 'react';

import { logger } from '@/lib/logger';

import { HLS_MAIN_CONFIG } from '../constants/hls.constants';
import { PLAYER_UI_COPY } from '../constants/player-ui.constants';
import {
  canPlayNativeHls,
  createHlsInstance,
  destroyHlsInstance,
  isHlsJsSupported,
  Hls as HlsClass,
} from '../services/hls.factory';

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
  onReady: () => void;
  onError: (message: string) => void;
  onTimeReset: () => void;
  onQualityReady?: (api: HlsQualityApi) => void;
}

export function useHlsPlayer({
  videoRef,
  src,
  reloadKey = 0,
  onReady,
  onError,
  onTimeReset,
  onQualityReady,
}: UseHlsPlayerOptions) {
  const prevSrcRef = useRef(src);

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
      hls = createHlsInstance(HLS_MAIN_CONFIG);
      hls.attachMedia(video);
      hls.loadSource(src);

      hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
        onReady();
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
      destroyHlsInstance(hls);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, reloadKey]);
}
