import { useCallback } from 'react';
export function useAsyncRetry() {
  /**
   * Use to async request that will retry on failure
   * Current setup relies on response status 404 for rejection and retry.
   *
   * @param func,function that returns a promise
   * @param retries number of retries
   *
   */
  const requestWithRetries = useCallback(async (func: () => Promise<any>, retries: number) => {
    let currentRetries = retries;
    const request = async () => {
      /**
       * the Promise won't resolve until the method is resolved. rejections are caught and return null.
       */
      const funcResponse = await new Promise((resolve, reject) => {
        setTimeout(() => resolve(func().catch(reject)), 3000);
      }).catch(() => null);

      if (funcResponse) {
        return funcResponse;
      }

      if (!currentRetries) {
        // @todo maybe a toast Error?
        return null;
      }

      currentRetries = currentRetries - 1;
      request();
    };

    return request();
  }, []);

  return { requestWithRetries };
}
