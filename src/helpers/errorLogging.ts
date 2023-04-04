import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { isProd, notProd } from '../utils/dev';

/**
 * Initializes error logging.
 */
export function initErrorLogging() {
  // Used for remote error reporting
  // https://sentry.io/organizations/decent-mg/issues/
  if (notProd()) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
      integrations: [new BrowserTracing()],

      // Setting tracesSampleRate to 1.0 captures 100%
      // of sentry transactions for performance monitoring.
      tracesSampleRate: 1.0,

      debug: true,
    });
  }
}

/**
 * Sets the wallet address of the currently connected wallet,
 * in order to add more context to Sentry events.
 * Pass `null` to unset the current wallet.
 * @param walletAddress the wallet address of the currently connected wallet
 */
export function setLoggedWallet(walletAddress: string | null) {
  if (isProd()) return;
  if (!walletAddress) {
    Sentry.setUser(null);
  } else {
    Sentry.setUser({
      id: walletAddress,
    });
  }
}

/**
 * Adds arbitrary context parameters, which are indexed/searchable
 * on Sentry event logging.
 * @param key the context key
 * @param value the context value
 */
export function setErrorContext(key: string, value: string) {
  if (isProd()) return;
  Sentry.setTag(key, value);
}

/**
 * Clears any additional context that has been added to currently logging
 * Sentry events.
 */
export function clearErrorContext() {
  if (isProd()) return;
  Sentry.setTags({});
  setLoggedWallet(null);
}

/**
 * Logs an error to Sentry and the console.
 * @param error the error to log. Strings are logged on Sentry as "messages", anything
 * else is logged as an exception.
 */
export function logError(error: any, ...optionalParams: any[]) {
  console.error(error, optionalParams);
  if (isProd()) return;
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
    errorInfo: React.ErrorInfo
  ) {
    console.error(error, errorInfo);
    if (isProd()) return;
    super.componentDidCatch(error, errorInfo);
  }
}
