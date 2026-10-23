import { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Mock env before importing api-client
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: 'https://phimapi.com/',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'test-key',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: 'https://test-rtdb.firebaseio.com',
  },
}));

import defaultRequest, {
  getRequest,
  getGoogleRequest,
  getAllRequest,
  inFlightTracker,
  googleRequest,
} from '@/services/api-client';

function mockResponse<T>(data: T, status = 200): AxiosResponse<T> {
  const headers = new AxiosHeaders();
  return {
    data,
    status,
    statusText: 'OK',
    headers,
    config: {
      headers,
    } as unknown as InternalAxiosRequestConfig,
  };
}

interface MockAxiosError extends Error {
  response?: { status: number; data: unknown };
  code?: string;
}

function createMockError(message: string, status?: number, code?: string): MockAxiosError {
  const err: MockAxiosError = new Error(message);
  if (status !== undefined) {
    err.response = { status, data: { message } };
  }
  if (code !== undefined) {
    err.code = code;
  }
  return err;
}

describe('Resilient api-client (Phase 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inFlightTracker.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    inFlightTracker.clear();
  });

  describe('In-Flight Request Deduplication', () => {
    it('deduplicates simultaneous identical GET requests into a single network call', async () => {
      let callCount = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        callCount += 1;
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 20));
        return mockResponse({ status: 'success', film: 'Bleach' });
      });

      // Fire 3 simultaneous requests to the same path & query
      const [res1, res2, res3] = await Promise.all([
        getRequest('v1/api/phim/bleach', { params: { ep: 1 } }),
        getRequest('/v1/api/phim/bleach', { params: { ep: 1 } }),
        getRequest('v1/api/phim/bleach', { params: { ep: 1 } }),
      ]);

      expect(callCount).toBe(1);
      expect((res1.data as { film: string }).film).toBe('Bleach');
      expect((res2.data as { film: string }).film).toBe('Bleach');
      expect((res3.data as { film: string }).film).toBe('Bleach');
      // In-flight tracker should be cleared once resolved
      expect(inFlightTracker.size()).toBe(0);
    });

    it('isolates different query parameters into separate requests', async () => {
      let callCount = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async (config) => {
        callCount += 1;
        const params = config.params as Record<string, unknown> | undefined;
        return mockResponse({ ep: params?.ep });
      });

      const [res1, res2] = await Promise.all([
        getRequest('v1/api/phim/bleach', { params: { ep: 1 } }),
        getRequest('v1/api/phim/bleach', { params: { ep: 2 } }),
      ]);

      expect(callCount).toBe(2);
      expect((res1.data as { ep: number }).ep).toBe(1);
      expect((res2.data as { ep: number }).ep).toBe(2);
    });

    it('bypasses deduplication when skipDedupe is true', async () => {
      let callCount = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        callCount += 1;
        return mockResponse({ ok: true });
      });

      await Promise.all([
        getRequest('v1/api/danh-sach', { skipDedupe: true }),
        getRequest('v1/api/danh-sach', { skipDedupe: true }),
      ]);

      expect(callCount).toBe(2);
    });

    it('triggers a fresh network request after the in-flight promise completes', async () => {
      let callCount = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        callCount += 1;
        return mockResponse({ count: callCount });
      });

      const firstRes = await getRequest('v1/api/danh-sach');
      expect((firstRes.data as { count: number }).count).toBe(1);

      const secondRes = await getRequest('v1/api/danh-sach');
      expect((secondRes.data as { count: number }).count).toBe(2);
      expect(callCount).toBe(2);
    });
  });

  describe('Transient Error Retry with Exponential Backoff', () => {
    it('retries transient 503 errors and succeeds on subsequent attempt', async () => {
      let attempt = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        attempt += 1;
        if (attempt === 1) {
          throw createMockError('Service Unavailable', 503);
        }
        return mockResponse({ recovered: true });
      });

      const res = await getRequest('v1/api/danh-sach', {
        retries: 2,
        baseDelayMs: 10,
        maxDelayMs: 50,
      });

      expect(attempt).toBe(2);
      expect((res.data as { recovered: boolean }).recovered).toBe(true);
    });

    it('retries network timeouts (ECONNABORTED) and recovers', async () => {
      let attempt = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        attempt += 1;
        if (attempt === 1) {
          throw createMockError('timeout of 20000ms exceeded', undefined, 'ECONNABORTED');
        }
        return mockResponse({ success: true });
      });

      const res = await getRequest('v1/api/phim', {
        retries: 2,
        baseDelayMs: 10,
        maxDelayMs: 50,
      });

      expect(attempt).toBe(2);
      expect((res.data as { success: boolean }).success).toBe(true);
    });

    it('fails immediately without retry on non-transient 404 client errors', async () => {
      let attempt = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        attempt += 1;
        throw createMockError('Not Found', 404);
      });

      await expect(
        getRequest('v1/api/phim/non-existent', { retries: 3, baseDelayMs: 10 })
      ).rejects.toThrow();

      expect(attempt).toBe(1);
    });

    it('throws AppError after exhausting all retry attempts', async () => {
      let attempt = 0;
      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        attempt += 1;
        throw createMockError('Bad Gateway', 502);
      });

      await expect(
        getRequest('v1/api/phim', { retries: 2, baseDelayMs: 5, maxDelayMs: 10 })
      ).rejects.toThrow();

      // 1 initial attempt + 2 retries = 3 attempts total
      expect(attempt).toBe(3);
    });
  });

  describe('AbortSignal Support', () => {
    it('aborts caller immediately if controller is aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(getRequest('v1/api/phim', { signal: controller.signal })).rejects.toThrow(
        'This operation was aborted'
      );
    });

    it('isolates aborted caller from concurrent callers sharing the same request', async () => {
      const controller = new AbortController();

      vi.spyOn(defaultRequest, 'request').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return mockResponse({ status: 'shared-success' });
      });

      const callA = getRequest('v1/api/shared');
      const callB = getRequest('v1/api/shared', { signal: controller.signal });

      // Abort call B while in-flight
      controller.abort();

      await expect(callB).rejects.toThrow('This operation was aborted');
      const resA = await callA;
      expect((resA.data as { status: string }).status).toBe('shared-success');
    });
  });

  describe('getAllRequest', () => {
    it('returns an empty array when given an empty paths list', async () => {
      const result = await getAllRequest([]);
      expect(result).toEqual([]);
    });

    it('fetches multiple paths concurrently, extracting .data for each', async () => {
      vi.spyOn(defaultRequest, 'request').mockImplementation(async (config) => {
        return mockResponse({ path: config.url });
      });

      const paths = ['v1/api/danh-sach', 'v1/api/phim-le', 'v1/api/phim-bo'];
      const results = await getAllRequest(paths);

      expect(results).toHaveLength(3);
      expect(results).toEqual([
        { path: 'v1/api/danh-sach' },
        { path: 'v1/api/phim-le' },
        { path: 'v1/api/phim-bo' },
      ]);
    });
  });

  describe('getGoogleRequest', () => {
    it('executes requests against the google client', async () => {
      const defaultSpy = vi.spyOn(defaultRequest, 'request');
      const googleSpy = vi
        .spyOn(googleRequest, 'request')
        .mockResolvedValue(mockResponse({ sub: 'google-user-123' }));

      const res = await getGoogleRequest('test-path', { skipDedupe: true });
      expect(defaultSpy).not.toHaveBeenCalled();
      expect(googleSpy).toHaveBeenCalled();
      expect(res.data).toEqual({ sub: 'google-user-123' });
    });
  });
});
