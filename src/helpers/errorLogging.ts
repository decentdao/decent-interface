import * as Sentry from '@sentry/react';

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
