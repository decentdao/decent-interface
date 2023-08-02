import { useCallback, useEffect, useRef, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

export const useUpdateTimer = (safeAddress?: string | null) => {
  // Use useRef to store timers without triggering unnecessary re-renders
  const timers = useRef<Map<string, NodeJS.Timer>>(new Map());
  const [isActive, setIsActive] = useState<boolean>(true);
  const twentySeconds = 20000; // in milliseconds

  // Use react-idle-timer to manage user idle state
  useIdleTimer({
    timeout: twentySeconds * 3 * 5, // 5 minutes
    onIdle: () => setIsActive(false),
    onActive: () => setIsActive(true),
  });

  // Set a method to be executed at a set interval, considering the user's idle state
  const setMethodOnInterval = useCallback(
    async (getMethod: () => Promise<any | undefined>, milliseconds: number = twentySeconds) => {
      let returnValue: any | undefined;
      returnValue = await Promise.resolve(getMethod());

      // Clear the interval if the method is already in the timers list
      const methodKey = getMethod.toString();
      if (timers.current.has(methodKey)) {
        clearInterval(timers.current.get(methodKey)!);
      }

      // Set the interval and store it in the timers list
      const intervalId = setInterval(() => {
        if (isActive) {
          Promise.resolve(getMethod());
        }
      }, milliseconds);

      timers.current.set(methodKey, intervalId);
      return returnValue;
    },
    [isActive]
  );

  const removeMethodInterval = useCallback(async (getMethod: () => Promise<any | undefined>) => {
    const methodKey = getMethod.toString();
    const intervalId = timers.current.get(methodKey);

    if (intervalId) {
      timers.current.delete(methodKey);
      clearInterval(intervalId);
    }
  }, []);

  // Clear intervals when the component is unmounted to avoid memory leaks
  useEffect(() => {
    const nodeTimers = timers.current;
    return () => {
      nodeTimers.forEach(timer => clearInterval(timer));
    };
  }, []);

  // Clear intervals based on the safeAddress value and testing environment
  useEffect(() => {
    if (!safeAddress || process.env.NEXT_PUBLIC_TESTING_ENVIRONMENT) {
      timers.current.forEach(timer => clearInterval(timer));
    }
  }, [safeAddress]);

  return { setMethodOnInterval, removeMethodInterval };
};
