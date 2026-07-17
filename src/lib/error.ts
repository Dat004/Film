export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public details: unknown;

  constructor(message: string, code: string, statusCode: number, details: unknown = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromApiResponse(error: unknown): AppError {
    if (isAxiosErrorLike(error)) {
      const { data, status } = error.response;
      return new AppError(
        data?.message || error.message || 'API Error',
        data?.code || 'API_ERROR',
        status,
        data?.details || null
      );
    }

    const errObj = error as Record<string, unknown> | null;
    return new AppError(
      errObj && typeof errObj['message'] === 'string' ? errObj['message'] : 'Network Error',
      'NETWORK_ERROR',
      500
    );
  }
}

function isAxiosErrorLike(error: unknown): error is {
  response: {
    data?: { message?: string; code?: string; details?: unknown };
    status: number;
  };
  message?: string;
} {
  if (typeof error !== 'object' || error === null) return false;
  if (!('response' in error)) return false;

  const response = (error as { response: unknown }).response;
  if (typeof response !== 'object' || response === null) return false;
  if (!('status' in response)) return false;

  const status = (response as { status: unknown }).status;
  return typeof status === 'number';
}
