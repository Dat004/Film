import { logger } from '@/lib/logger';

/**
 * Registers the Media Service Worker (sw-media.js) for video chunk caching & prefetching.
 */
export function registerMediaServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register('/sw-media.js', { scope: '/' })
    .then((registration) => {
      return registration;
    })
    .catch((error) => {
      logger.warn('[SW Register Error]', { error: String(error) });
      return null;
    });
}
