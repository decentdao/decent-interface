import { useCallback } from 'react';
export function useAsyncRetry() {
  const requestWithRetries = useCallback(async (func: () => Promise<any>, retries: number) => {
    let currentRetries = retries;
    const request = async () => {
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
