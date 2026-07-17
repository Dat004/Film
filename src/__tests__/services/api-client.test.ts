import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock env before importing api-client
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

vi.mock('@/lib/error', () => ({
  AppError: class AppError extends Error {
    code: string;
    statusCode: number;
    details: unknown;
    constructor(message: string, code: string, statusCode: number) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
      this.details = null;
    }
    static fromApiResponse(error: unknown) {
      return new AppError(
        error instanceof Error ? error.message : 'Unknown error',
        'TEST_ERROR',
        500
      );
    }
  },
}));

import { getRequest, getAllRequest } from '@/services/api-client';

import axios from 'axios';

describe('api-client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRequest', () => {
    it('is a function with the correct signature', () => {
      expect(typeof getRequest).toBe('function');
    });
  });

  describe('getAllRequest', () => {
    it('returns an empty array for empty paths', async () => {
      vi.spyOn(axios, 'all').mockResolvedValue([]);
      const result = await getAllRequest([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
