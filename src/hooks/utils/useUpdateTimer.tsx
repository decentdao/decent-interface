import { useCallback, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

export const useUpdateTimer = (safeAddress?: string | null) => {
  const [timers, setTimers] = useState<{ method: string; timerId: NodeJS.Timer }[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const twentySeconds = 20000; // in milliseconds

  useIdleTimer({
    timeout: twentySeconds * 3 * 5, // 5 minutes
    onIdle: () => setIsActive(false),
    onActive: () => setIsActive(true),
  });

  const setMethodOnInterval = useCallback(
    (getMethod: () => Promise<void>, milliseconds: number = twentySeconds) => {
      Promise.resolve(getMethod());
      setTimers(prevState => {
        const filteredTimers = prevState.filter(timer => {
          const isAlreadySet = timer.method === getMethod.toString();
          if (isAlreadySet) {
            clearInterval(timer.timerId);
          }
          return !isAlreadySet;
        });

        const intervalId = setInterval(() => {
          if (isActive) {
            Promise.resolve(getMethod());
          }
        }, milliseconds);
        return [...filteredTimers, { method: getMethod.toString(), timerId: intervalId }];
      });
    },
    [isActive]
  );
  useEffect(() => {
    if (!safeAddress || process.env.NEXT_PUBLIC_TESTING_ENVIROMENT) {
      timers.forEach(timer => clearInterval(timer.timerId));
    }
    return () => {
      timers.forEach(timer => clearInterval(timer.timerId));
    };
  }, [safeAddress, timers]);
  return { setMethodOnInterval };
};
