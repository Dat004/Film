import { useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import { registerMediaServiceWorker } from '@/services/sw-media-register';

import { useVideoPlayerStore } from '../store/video-player-store';

export interface UseMediaPrefetchOptions {
  nextEpisodeM3u8Url?: string | null | undefined;
  prefetchThresholdSec?: number;
}

/**
 * Parses an m3u8 playlist text to extract the first N segment chunk or sub-playlist URLs.
 */
export function parseM3u8Segments(m3u8Text: string, baseUrl: string, maxSegments = 3): string[] {
  const lines = m3u8Text.split(/\r?\n/);
  const segments: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    try {
      // Resolve relative segment URL against base m3u8 URL
      const absoluteUrl = new URL(trimmed, baseUrl).href;
      segments.push(absoluteUrl);
      if (segments.length >= maxSegments) break;
    } catch {
      /* Invalid URL fallback */
    }
  }

  return segments;
}

/**
 * Recursively fetches and resolves master playlists down to actual .ts segment chunk URLs.
 */
export async function fetchAndParseSegments(url: string, maxSegments = 3): Promise<string[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();

    // If Master Playlist, resolve the first variant stream playlist (e.g. 3500kb/hls/index.m3u8)
    if (text.includes('#EXT-X-STREAM-INF')) {
      const variantUrls = parseM3u8Segments(text, url, 1);
      if (variantUrls[0]) {
        return fetchAndParseSegments(variantUrls[0], maxSegments);
      }
    }

    return parseM3u8Segments(text, url, maxSegments);
  } catch (err) {
    logger.warn('[MediaPrefetch Fetch Error]', { error: String(err) });
    return [];
  }
}

export function useMediaPrefetch({
  nextEpisodeM3u8Url,
  prefetchThresholdSec = 30,
}: UseMediaPrefetchOptions = {}) {
  const { currentTime, duration } = useVideoPlayerStore((s) => s.time);
  const prefetchedUrlsRef = useRef<Set<string>>(new Set());
  const [isSwReady, setIsSwReady] = useState(false);

  // Register Service Worker on mount
  useEffect(() => {
    void registerMediaServiceWorker().then((reg) => {
      if (reg) {
        setIsSwReady(true);
        logger.info('[MediaPrefetch] Service Worker registered and active for media caching');
      }
    });
  }, []);

  // Monitor playback progress and trigger prefetch when remaining time <= prefetchThresholdSec
  useEffect(() => {
    if (!nextEpisodeM3u8Url || duration <= 0) return;

    const remainingTime = duration - currentTime;
    if (remainingTime > prefetchThresholdSec) return;

    if (prefetchedUrlsRef.current.has(nextEpisodeM3u8Url)) return;
    prefetchedUrlsRef.current.add(nextEpisodeM3u8Url);

    async function prefetchNextEpisode() {
      try {
        const segmentUrls = await fetchAndParseSegments(nextEpisodeM3u8Url!, 3);

        if (segmentUrls.length > 0 && typeof window !== 'undefined') {
          logger.info('[MediaPrefetch] Prefetching next episode segment chunks', { segmentUrls });

          // Fallback: If Service Worker controller is not attached yet, fetch directly into CacheStorage
          if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SW_PREFETCH_SEGMENTS',
              urls: segmentUrls,
            });
          } else if ('caches' in window) {
            const cache = await caches.open('media-segments-v1');
            for (const url of segmentUrls) {
              try {
                const res = await fetch(url, { mode: 'cors' });
                if (res.ok) {
                  await cache.put(url, res);
                  logger.info('[Direct Media Cache] Cached segment', { url });
                }
              } catch (e) {
                logger.warn('[Direct Cache Error]', { error: String(e) });
              }
            }
          }
        }
      } catch (err) {
        logger.warn('[MediaPrefetch Error]', { error: String(err) });
      }
    }

    void prefetchNextEpisode();
  }, [currentTime, duration, nextEpisodeM3u8Url, prefetchThresholdSec]);

  return { isSwReady };
}
