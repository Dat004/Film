type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

function log(
  message: string,
  level: LogLevel = 'info',
  context: LogContext | null = null,
  error: Error | null = null
) {
  if (process.env.NODE_ENV === 'development') {
    const args: unknown[] = [`[${level.toUpperCase()}] ${message}`];
    if (context) args.push(context);
    if (error) args.push(error);

    if (level === 'debug' || level === 'info') {
      console.info(...args);
    } else if (level === 'warn') {
      console.warn(...args);
    } else {
      console.error(...args);
    }
  } else {
    // Production: send to Sentry or equivalent monitoring service
    // if (level === "error" && error) {
    //   Sentry.captureException(error, { extra: context ?? undefined });
    // }
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log(message, 'debug', context ?? null),
  info: (message: string, context?: LogContext) => log(message, 'info', context ?? null),
  warn: (message: string, context?: LogContext) => log(message, 'warn', context ?? null),
  error: (message: string, error?: Error, context?: LogContext) =>
    log(message, 'error', context ?? null, error ?? null),
};
