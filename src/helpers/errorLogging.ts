import * as Sentry from '@sentry/react';
import { isProd } from '../utils/dev';

/**
 * Sentry key which allows pushing error events.  Since this only allows submission of new events,
 * but not reading them, this is fine to have public.
 *
 * https://docs.sentry.io/product/sentry-basics/dsn-explainer/
 */
const SENTRY_DSN_DEV =
  'https://23bdd0d2ce384e51a6b9d8c478767327@o4505173268365312.ingest.sentry.io/4505195485265920';

/**
 * Initializes error logging. We do not log Sentry data in production.
 */
export function initErrorLogging() {
  if (!isProd()) {
    Sentry.init({
      dsn: SENTRY_DSN_DEV,
      integrations: [Sentry.browserTracingIntegration()],

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
    logError(error, errorInfo);
    if (isProd()) return;
    super.componentDidCatch(error, errorInfo);
  }
}
