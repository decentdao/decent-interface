import { useCallback } from 'react';
import { logError } from '../../helpers/errorLogging';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useAsyncRetry() {
  const requestWithRetries = useCallback(
    async <T>(func: () => Promise<T>, retries: number, secondsToWait: number = 2000) => {
      let currentRetries = 0;
      let result = null;

      while (currentRetries <= retries) {
        try {
          result = await func();
          if (result) {
            return result;
          }
        } catch (error) {
          logError('Error in requestWithRetries:', error);
        }

        currentRetries += 1;
        if (currentRetries <= retries) {
          await sleep(secondsToWait);
        }
      }

      return result;
    },
    [],
  );

  return { requestWithRetries };
}
