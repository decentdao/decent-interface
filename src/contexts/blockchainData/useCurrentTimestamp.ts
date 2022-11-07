import { useEffect, useState } from 'react';
import { logError } from '../../helpers/errorLogging';
import { useWeb3Provider } from './../web3Data/hooks/useWeb3Provider';

const useCurrentTimestamp = (blockNumber: number | undefined) => {
  const [timestamp, setTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const {
    state: { provider },
  } = useWeb3Provider();
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(oldTimestamp => oldTimestamp + 1), 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!provider || blockNumber === undefined) {
      setTimestamp(Math.floor(Date.now() / 1000));
      return;
    }

    provider
      .getBlock(blockNumber)
      .then(block => {
        // sometimes block is null idk why
        if (!block) {
          return;
        }

        setTimestamp(block.timestamp);
      })
      .catch(logError);
  }, [provider, blockNumber]);

  return timestamp;
};

export default useCurrentTimestamp;
