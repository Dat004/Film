import type { AxiosError } from 'axios';

/**
 * Mã trạng thái lỗi tạm thời
 * Các lỗi tạm thời không nên retry hoặc retry với backoff.
 */
export const TRANSIENT_STATUS_CODES = new Set<number>([
  408, // Request Timeout
  429, // Too Many Requests / Rate Limit
  500, // Internal Server Error (upstream third-party API glitch)
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

/**
 * Các mã lỗi mạng tạm thời
 */
export const TRANSIENT_NETWORK_CODES = new Set<string>([
  'ECONNABORTED',
  'ERR_NETWORK',
  'ETIMEDOUT',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

/**
 * Kiểm tra lỗi có phải là lỗi tạm thời không
 */
export function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  // Không retry lỗi do user chủ động hủy
  if (isAbortError(error)) {
    return false;
  }

  const err = error as Partial<AxiosError> & {
    status?: number;
    statusCode?: number;
    code?: string;
    message?: string;
  };

  // 1. Kiểm tra mã trạng thái HTTP
  const status = err.response?.status ?? err.status ?? err.statusCode;
  if (typeof status === 'number') {
    if (TRANSIENT_STATUS_CODES.has(status)) {
      return true;
    }
    // Các lỗi client (400, 401, 403, 404, 422, etc.) không nên retry
    if (status >= 400 && status < 500) {
      return false;
    }
  }

  // 2. Kiểm tra mã lỗi network / axios
  if (err.code && TRANSIENT_NETWORK_CODES.has(err.code)) {
    return true;
  }

  // 3. Kiểm tra message
  const message = (err.message || '').toLowerCase();
  if (
    message.includes('network error') ||
    message.includes('timeout') ||
    message.includes('econnreset')
  ) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra lỗi có phải do user chủ động hủy không
 */
export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { name?: string; code?: string; message?: string };
  return (
    err.name === 'AbortError' ||
    err.name === 'CanceledError' ||
    err.code === 'ERR_CANCELED' ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('aborted'))
  );
}

/**
 * Tính toán thời gian delay với exponential backoff và decorrelated jitter
 * để ngăn chặn thundering herds trên các dịch vụ upstream.
 */
export function calculateBackoffWithJitter(
  attempt: number,
  baseDelayMs: number = 300,
  maxDelayMs: number = 3000
): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, Math.max(0, attempt - 1)));
  // Jitter factor between 0.75x and 1.25x
  const jitterFactor = 0.75 + Math.random() * 0.5;
  return Math.min(maxDelayMs, Math.round(exponential * jitterFactor));
}

export type ResilientAbortSignal =
  | AbortSignal
  | {
      readonly aborted: boolean;
      addEventListener?: (type: 'abort', listener: () => void, options?: unknown) => void;
      removeEventListener?: (type: 'abort', listener: () => void) => void;
    };

/**
 * Hẹn giờ delay có thể bị hủy
 */
export function delay(ms: number, signal?: ResilientAbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException('This operation was aborted', 'AbortError'));
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    const onAbort = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      reject(new DOMException('This operation was aborted', 'AbortError'));
    };

    timer = setTimeout(() => {
      signal?.removeEventListener?.('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener?.('abort', onAbort, { once: true });
  });
}

/**
 * Tạo key để deduplicate request
 * Sort các object keys để đảm bảo { a: 1, b: 2 } và { b: 2, a: 1 } cho ra key giống nhau.
 */
export function createRequestDeduplicationKey(
  method: string,
  path: string,
  params?: unknown
): string {
  const normalizedMethod = method.toUpperCase();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!params) {
    return `${normalizedMethod}:${normalizedPath}`;
  }

  let serializedParams = '';
  if (typeof params === 'object' && params !== null) {
    if (params instanceof URLSearchParams) {
      const sorted = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
      serializedParams = sorted
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    } else {
      const keys = Object.keys(params as Record<string, unknown>).sort();
      const pairs: string[] = [];
      for (const key of keys) {
        const val = (params as Record<string, unknown>)[key];
        if (val !== undefined && val !== null) {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
        }
      }
      serializedParams = pairs.join('&');
    }
  } else {
    serializedParams = String(params);
  }

  return serializedParams
    ? `${normalizedMethod}:${normalizedPath}?${serializedParams}`
    : `${normalizedMethod}:${normalizedPath}`;
}

/**
 * Quản lý map deduplicate request.
 */
export class InFlightRequestTracker<T = unknown> {
  private map = new Map<string, Promise<T>>();

  get(key: string): Promise<T> | undefined {
    return this.map.get(key);
  }

  set(key: string, promise: Promise<T>): void {
    this.map.set(key, promise);
  }

  delete(key: string): boolean {
    return this.map.delete(key);
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }
}

/**
 * Attach AbortSignal vào shared Promise. Nếu signal fires trước khi shared
 * promise resolve, promise này sẽ reject ngay lập tức với AbortError
 * mà không abort underlying shared promise cho các caller khác.
 */
export function attachAbortSignal<T>(
  promise: Promise<T>,
  signal?: ResilientAbortSignal | null
): Promise<T> {
  if (!signal) return promise;

  if (signal.aborted) {
    return Promise.reject(new DOMException('This operation was aborted', 'AbortError'));
  }

  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const onAbort = () => {
      if (!settled) {
        settled = true;
        reject(new DOMException('This operation was aborted', 'AbortError'));
      }
    };

    signal.addEventListener?.('abort', onAbort, { once: true });

    promise.then(
      (value) => {
        if (!settled) {
          settled = true;
          signal.removeEventListener?.('abort', onAbort);
          resolve(value);
        }
      },
      (error) => {
        if (!settled) {
          settled = true;
          signal.removeEventListener?.('abort', onAbort);
          reject(error);
        }
      }
    );
  });
}
