import { describe, it, expect, vi } from 'vitest';

import {
  isTransientError,
  isAbortError,
  calculateBackoffWithJitter,
  delay,
  createRequestDeduplicationKey,
  InFlightRequestTracker,
  attachAbortSignal,
} from '@/lib/http-resilience';

describe('http-resilience utilities', () => {
  describe('isTransientError', () => {
    it('identifies transient HTTP status codes as retryable', () => {
      expect(isTransientError({ response: { status: 500 } })).toBe(true);
      expect(isTransientError({ response: { status: 502 } })).toBe(true);
      expect(isTransientError({ response: { status: 503 } })).toBe(true);
      expect(isTransientError({ response: { status: 504 } })).toBe(true);
      expect(isTransientError({ response: { status: 408 } })).toBe(true);
      expect(isTransientError({ response: { status: 429 } })).toBe(true);
      expect(isTransientError({ statusCode: 503 })).toBe(true);
    });

    it('rejects client errors as non-retryable', () => {
      expect(isTransientError({ response: { status: 400 } })).toBe(false);
      expect(isTransientError({ response: { status: 401 } })).toBe(false);
      expect(isTransientError({ response: { status: 403 } })).toBe(false);
      expect(isTransientError({ response: { status: 404 } })).toBe(false);
      expect(isTransientError({ response: { status: 422 } })).toBe(false);
      expect(isTransientError({ statusCode: 404 })).toBe(false);
    });

    it('identifies network error codes as retryable', () => {
      expect(isTransientError({ code: 'ECONNABORTED' })).toBe(true);
      expect(isTransientError({ code: 'ERR_NETWORK' })).toBe(true);
      expect(isTransientError({ code: 'ETIMEDOUT' })).toBe(true);
      expect(isTransientError({ code: 'ECONNRESET' })).toBe(true);
      expect(isTransientError({ message: 'Network Error' })).toBe(true);
      expect(isTransientError({ message: 'timeout of 20000ms exceeded' })).toBe(true);
    });

    it('never marks aborted requests as transient', () => {
      expect(isTransientError({ name: 'AbortError' })).toBe(false);
      expect(isTransientError({ name: 'CanceledError' })).toBe(false);
      expect(isTransientError({ code: 'ERR_CANCELED' })).toBe(false);
      expect(isTransientError({ message: 'This operation was aborted' })).toBe(false);
    });

    it('handles null, undefined, or primitive inputs safely', () => {
      expect(isTransientError(null)).toBe(false);
      expect(isTransientError(undefined)).toBe(false);
      expect(isTransientError('some string')).toBe(false);
      expect(isTransientError(123)).toBe(false);
    });
  });

  describe('isAbortError', () => {
    it('accurately identifies cancellation instances', () => {
      expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true);
      expect(isAbortError({ code: 'ERR_CANCELED' })).toBe(true);
      expect(isAbortError({ message: 'Request aborted' })).toBe(true);
      expect(isAbortError(new Error('Network glitch'))).toBe(false);
    });
  });

  describe('calculateBackoffWithJitter', () => {
    it('increases exponentially across retry attempts', () => {
      const delay1 = calculateBackoffWithJitter(1, 100, 2000);
      const delay2 = calculateBackoffWithJitter(2, 100, 2000);
      const delay3 = calculateBackoffWithJitter(3, 100, 2000);

      expect(delay1).toBeGreaterThanOrEqual(75);
      expect(delay1).toBeLessThanOrEqual(150);

      expect(delay2).toBeGreaterThanOrEqual(150);
      expect(delay2).toBeLessThanOrEqual(300);

      expect(delay3).toBeGreaterThanOrEqual(300);
      expect(delay3).toBeLessThanOrEqual(600);
    });

    it('caps the maximum delay at maxDelayMs', () => {
      const largeDelay = calculateBackoffWithJitter(10, 100, 1000);
      expect(largeDelay).toBeLessThanOrEqual(1000);
    });
  });

  describe('delay', () => {
    it('resolves after the specified duration', async () => {
      const start = Date.now();
      await delay(20);
      expect(Date.now() - start).toBeGreaterThanOrEqual(15);
    });

    it('rejects immediately if signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(delay(1000, controller.signal)).rejects.toThrow('This operation was aborted');
    });

    it('aborts early when signal fires during delay', async () => {
      const controller = new AbortController();
      const promise = delay(1000, controller.signal);
      setTimeout(() => controller.abort(), 10);
      await expect(promise).rejects.toThrow('This operation was aborted');
    });
  });

  describe('createRequestDeduplicationKey', () => {
    it('creates deterministic keys irrespective of query param ordering', () => {
      const key1 = createRequestDeduplicationKey('GET', '/v1/api/danh-sach', {
        page: 1,
        limit: 10,
      });
      const key2 = createRequestDeduplicationKey('get', 'v1/api/danh-sach', { limit: 10, page: 1 });
      expect(key1).toBe('GET:/v1/api/danh-sach?limit=10&page=1');
      expect(key1).toBe(key2);
    });

    it('handles paths without parameters', () => {
      expect(createRequestDeduplicationKey('GET', 'v1/api/home')).toBe('GET:/v1/api/home');
    });

    it('supports URLSearchParams objects', () => {
      const params = new URLSearchParams();
      params.append('b', '2');
      params.append('a', '1');
      expect(createRequestDeduplicationKey('GET', '/test', params)).toBe('GET:/test?a=1&b=2');
    });
  });

  describe('InFlightRequestTracker', () => {
    it('manages key-promise mappings properly', () => {
      const tracker = new InFlightRequestTracker<string>();
      expect(tracker.size()).toBe(0);

      const promise = Promise.resolve('data');
      tracker.set('key1', promise);
      expect(tracker.has('key1')).toBe(true);
      expect(tracker.get('key1')).toBe(promise);
      expect(tracker.size()).toBe(1);

      tracker.delete('key1');
      expect(tracker.has('key1')).toBe(false);
      expect(tracker.size()).toBe(0);
    });

    it('clears all tracked requests', () => {
      const tracker = new InFlightRequestTracker();
      tracker.set('k1', Promise.resolve());
      tracker.set('k2', Promise.resolve());
      tracker.clear();
      expect(tracker.size()).toBe(0);
    });
  });

  describe('attachAbortSignal', () => {
    it('passes through resolved value when not aborted', async () => {
      const result = await attachAbortSignal(Promise.resolve('ok'));
      expect(result).toBe('ok');
    });

    it('rejects immediately if signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      await expect(attachAbortSignal(Promise.resolve('ok'), controller.signal)).rejects.toThrow(
        'This operation was aborted'
      );
    });

    it('aborts caller promise without affecting underlying resolution', async () => {
      const controller = new AbortController();
      let underlyingResolved = false;

      const slowPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          underlyingResolved = true;
          resolve('slow-data');
        }, 30);
      });

      const callerPromise = attachAbortSignal(slowPromise, controller.signal);
      controller.abort();

      await expect(callerPromise).rejects.toThrow('This operation was aborted');
      // Wait for underlying promise to finish to confirm it wasn't broken
      const result = await slowPromise;
      expect(underlyingResolved).toBe(true);
      expect(result).toBe('slow-data');
    });
  });
});
