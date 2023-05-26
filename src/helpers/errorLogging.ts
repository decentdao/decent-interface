import { isProd, notProd } from '../utils/dev';

/**
 * Initializes error logging. We do not log Sentry data in production.
 */
export function initErrorLogging() {
  if (notProd()) {
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
  } else {
  }
}

/**
 * Clears any additional context that has been added to currently logging
 * Sentry events.
 */
export function clearErrorContext() {
  if (isProd()) return;
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
  } else {
  }
}
