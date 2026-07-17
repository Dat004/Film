import { describe, it, expect } from 'vitest';

import { AppError } from '@/lib/error';

describe('AppError', () => {
  it('creates an AppError with correct properties', () => {
    const err = new AppError('Something went wrong', 'ERR_CODE', 500, { field: 'email' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe('ERR_CODE');
    expect(err.statusCode).toBe(500);
    expect(err.details).toEqual({ field: 'email' });
    expect(err.name).toBe('AppError');
  });

  describe('fromApiResponse', () => {
    it('creates an AppError from an axios-like error', () => {
      const axiosError = {
        response: {
          data: { message: 'Not Found', code: 'NOT_FOUND', details: null },
          status: 404,
        },
        message: 'Request failed with status code 404',
      };

      const appError = AppError.fromApiResponse(axiosError);
      expect(appError.message).toBe('Not Found');
      expect(appError.code).toBe('NOT_FOUND');
      expect(appError.statusCode).toBe(404);
    });

    it('falls back to response.message if data.message is missing', () => {
      const axiosError = {
        response: { data: {}, status: 500 },
        message: 'Internal Server Error',
      };

      const appError = AppError.fromApiResponse(axiosError);
      expect(appError.message).toBe('Internal Server Error');
      expect(appError.statusCode).toBe(500);
    });

    it('creates a NETWORK_ERROR when no response is present', () => {
      const networkError = new Error('Network Error');
      const appError = AppError.fromApiResponse(networkError);
      expect(appError.code).toBe('NETWORK_ERROR');
      expect(appError.statusCode).toBe(500);
    });

    it('handles completely unknown error shapes', () => {
      const appError = AppError.fromApiResponse('unexpected string error');
      expect(appError.code).toBe('NETWORK_ERROR');
    });
  });
});
