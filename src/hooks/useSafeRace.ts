import { useEffect } from 'react';
import { logError } from '../helpers/errorLogging';

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
      .catch(logError);

    return () => {
      pending = false;
    };
  }, [earlyExitCondition, earlyExitCallback, asyncCallback, setStateCallback]);
}

export default useSafeRace;
