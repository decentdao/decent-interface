import { useCallback, useEffect, useRef, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

export const useUpdateTimer = (safeAddress?: string | null) => {
  // Use useRef to store timers without triggering unnecessary re-renders
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());
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
    async <T,>(getMethod: () => Promise<T>, milliseconds: number = twentySeconds) => {
      let returnValue: T;
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
    [isActive],
  );

  // clear intervals
  const clearIntervals = () => {
    timers.current.forEach(timer => clearInterval(timer));
  };

  // Clear intervals when the component is unmounted to avoid memory leaks
  useEffect(() => {
    const nodeTimers = timers.current;
    return () => {
      nodeTimers.forEach(timer => clearInterval(timer));
    };
  }, []);

  // Clear intervals based on the safeAddress value and testing environment
  useEffect(() => {
    if (!safeAddress) {
      timers.current.forEach(timer => clearInterval(timer));
    }
  }, [safeAddress]);

  return { setMethodOnInterval, clearIntervals };
};
