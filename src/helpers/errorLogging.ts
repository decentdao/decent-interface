import * as Sentry from '@sentry/react';

/**
 * Initializes error logging.
 */
export function initErrorLogging() {
  if (
    process.env.NODE_ENV === 'development' ||
    import.meta.env.VITE_APP_SENTRY_DSN_URL === undefined
  ) {
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

/**
 * Logs an error to Sentry and the console.
 * @param error the error to log. Strings are logged on Sentry as "messages", anything
 * else is logged as an exception.
 */
export function logError(error: any, ...optionalParams: any[]) {
  console.error(error, optionalParams);
  if (process.env.NODE_ENV === 'development') return;
  if (typeof error === 'string' || error instanceof String) {
    Sentry.captureMessage(error + ': ' + optionalParams);
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Extension of Sentry's ErrorBoundary class which simply logs the error to
 * console as well.
 */
export class FractalErrorBoundary extends Sentry.ErrorBoundary {
  componentDidCatch(
    error: Error & {
      cause?: Error;
    },
    errorInfo: React.ErrorInfo,
  ) {
    logError(error, errorInfo);
    if (process.env.NODE_ENV === 'development') return;
    super.componentDidCatch(error, errorInfo);
  }
}
