import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

/**
 * Initializes error logging.
 */
function initErrorLogging() {
  if (
    process.env.NODE_ENV === 'development' ||
    import.meta.env.VITE_APP_SENTRY_DSN_URL === undefined
  ) {
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_APP_SENTRY_DSN_URL,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
      }),
    ],

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

initErrorLogging();

/**
 * Logs an error to Sentry and the console.
 * @param error the error to log. Strings are logged on Sentry as "messages", anything
 * else is logged as an exception.
 */
export function logError(error: any, ...optionalParams: any[]) {
  console.error(error, optionalParams);
  if (typeof error === 'string' || error instanceof String) {
    Sentry.captureMessage(error + ': ' + optionalParams);
  } else {
    Sentry.captureException(error);
  }
}
