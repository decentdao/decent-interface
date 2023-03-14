import { useCallback, useEffect, useState } from 'react';

export const useUpdateTimer = (safeAddress?: string) => {
  const [timers, setTimers] = useState<NodeJS.Timer[]>([]);
  const twentySeconds = 20000; // in milliseconds

  const setMethodOnInterval = useCallback(
    (getMethod: () => Promise<void>, milliseconds: number = twentySeconds) => {
      Promise.resolve(getMethod());
      const intervalId = setInterval(() => {
        Promise.resolve(getMethod());
      }, milliseconds);
      setTimers(prevState => [...prevState, intervalId]);
    },
    []
  );
  useEffect(() => {
    if (!safeAddress || process.env.REACT_APP_TESTING_ENVIROMENT) {
      timers.forEach(timer => clearInterval(timer));
    }
  }, [safeAddress, timers]);
  return { setMethodOnInterval };
};
