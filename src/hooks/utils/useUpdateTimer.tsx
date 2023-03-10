import { useCallback, useEffect, useState } from 'react';

export const useUpdateTimer = (safeAddress?: string) => {
  const [timers, setTimers] = useState<{ methodName: string; timerId: NodeJS.Timer }[]>([]);
  const twentySeconds = 20000; // in milliseconds

  const setMethodOnInterval = useCallback(
    (getMethod: () => Promise<void>, milliseconds: number = twentySeconds) => {
      Promise.resolve(getMethod());
      setTimers(prevState => {
        const filteredTimers = prevState.filter(timer => {
          const isAlreadySet = timer.methodName === getMethod.toString();
          if (isAlreadySet) {
            clearInterval(timer.timerId);
          }
          return !isAlreadySet;
        });

        const intervalId = setInterval(() => {
          Promise.resolve(getMethod());
        }, milliseconds);
        return [...filteredTimers, { methodName: getMethod.toString(), timerId: intervalId }];
      });
    },
    []
  );
  useEffect(() => {
    if (!safeAddress || process.env.REACT_APP_TESTING_ENVIROMENT) {
      timers.forEach(timer => clearInterval(timer.timerId));
    }
  }, [safeAddress, timers]);
  return { setMethodOnInterval };
};
