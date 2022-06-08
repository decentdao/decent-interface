import { useEffect } from 'react';

function useSafeRace<T>(
  earlyExitCondition: boolean,
  earlyExitCallback: () => void,
  asyncCallback: () => Promise<T>,
  setStateCallback: (resolved: T) => void
) {
  useEffect(() => {
    let pending = true;

    if (earlyExitCondition) {
      earlyExitCallback();
      return;
    }

    asyncCallback()
      .then(resolved => {
        if (pending) {
          setStateCallback(resolved);
        }
      })
      .catch(console.error);

    return () => {
      pending = false;
    };
  }, [earlyExitCondition, earlyExitCallback, asyncCallback, setStateCallback]);
}

export default useSafeRace;
