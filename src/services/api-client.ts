import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { env } from '@/lib/env';
import { AppError } from '@/lib/error';
import {
  attachAbortSignal,
  calculateBackoffWithJitter,
  createRequestDeduplicationKey,
  delay,
  InFlightRequestTracker,
  isTransientError,
} from '@/lib/http-resilience';
import { logger } from '@/lib/logger';

const BASE_URL = env.NEXT_PUBLIC_API_BASE_URL;
const GOOGLE_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface ResilientRequestConfig extends AxiosRequestConfig {
  /** Số lần retry tối đa cho lỗi transient */
  retries?: number;
  /** Thời gian delay ban đầu trước khi exponential backoff */
  baseDelayMs?: number;
  /** Thời gian delay tối đa */
  maxDelayMs?: number;
  /** Nếu true, bỏ qua việc deduplicate request */
  skipDedupe?: boolean;
}

export const inFlightTracker = new InFlightRequestTracker<AxiosResponse>();

export const defaultRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

export const googleRequest = axios.create({
  baseURL: GOOGLE_URL,
  timeout: 20000,
});

// Các bộ điều khiển phản hồi để chuẩn hóa lỗi thành AppError khi gọi trực tiếp
defaultRequest.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(AppError.fromApiResponse(error))
);

googleRequest.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(AppError.fromApiResponse(error))
);

/**
 * Hàm thực thi request với khả năng tự động deduplicate request,
 * exponential jittered backoff và non-blocking caller-level abort propagation.
 */
export async function executeResilientRequest(
  client: AxiosInstance,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path = '',
  options: ResilientRequestConfig = {}
): Promise<AxiosResponse> {
  const {
    retries = 2,
    baseDelayMs = 300,
    maxDelayMs = 3000,
    skipDedupe = false,
    signal,
    params,
    ...axiosOptions
  } = options;

  if (signal?.aborted) {
    return Promise.reject(new DOMException('This operation was aborted', 'AbortError'));
  }

  const isGet = method.toUpperCase() === 'GET';
  const shouldDedupe = isGet && !skipDedupe;
  const cacheKey = shouldDedupe ? createRequestDeduplicationKey(method, path, params) : null;

  // 1. Tự động deduplicate request cho idempotent GET calls
  if (cacheKey && inFlightTracker.has(cacheKey)) {
    const existingPromise = inFlightTracker.get(cacheKey)!;
    return attachAbortSignal(existingPromise, signal);
  }

  // 2. Vòng lặp thực thi request với khả năng tự động retry lỗi transient với exponential backoff
  const requestExecution = async (): Promise<AxiosResponse> => {
    let attempt = 0;

    while (true) {
      attempt += 1;
      try {
        const requestConfig: AxiosRequestConfig = {
          url: path,
          method,
          ...axiosOptions,
        };
        if (params !== undefined) {
          requestConfig.params = params;
        }
        if (!shouldDedupe && signal) {
          requestConfig.signal = signal;
        }
        const response = await client.request(requestConfig);
        return response;
      } catch (error) {
        const isLastAttempt = attempt > retries;
        const canRetry = !isLastAttempt && isTransientError(error) && !signal?.aborted;

        if (!canRetry) {
          if (error instanceof AppError) {
            throw error;
          }
          throw AppError.fromApiResponse(error);
        }

        const backoffMs = calculateBackoffWithJitter(attempt, baseDelayMs, maxDelayMs);
        logger.warn('[ApiClient] Transient request error encountered, retrying with backoff', {
          path,
          attempt,
          maxRetries: retries,
          backoffMs,
        });

        await delay(backoffMs, signal);
      }
    }
  };

  if (cacheKey) {
    const promise = requestExecution().finally(() => {
      inFlightTracker.delete(cacheKey);
    });
    // Attach no-op catch để ngăn chặn UnhandledPromiseRejection nếu một caller aborts early
    promise.catch(() => {});
    inFlightTracker.set(cacheKey, promise);
    return attachAbortSignal(promise, signal);
  }

  return requestExecution();
}

export const getRequest = async (
  path = '',
  options: ResilientRequestConfig = {}
): Promise<AxiosResponse> => {
  return executeResilientRequest(defaultRequest, 'GET', path, options);
};

export const getGoogleRequest = async (
  path = '',
  options: ResilientRequestConfig = {}
): Promise<AxiosResponse> => {
  return executeResilientRequest(googleRequest, 'GET', path, options);
};

export const getAllRequest = async (
  paths: string[] = [],
  options: ResilientRequestConfig = {}
): Promise<unknown[]> => {
  if (paths.length === 0) return [];
  const requests = paths.map((path) => getRequest(path, options));

  try {
    const responses = await Promise.all(requests);
    return responses.map((response) => response.data);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.fromApiResponse(error);
  }
};

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { __apiClient?: unknown }).__apiClient = {
    getRequest,
    getAllRequest,
    getGoogleRequest,
    inFlightTracker,
  };
}

export default defaultRequest;
