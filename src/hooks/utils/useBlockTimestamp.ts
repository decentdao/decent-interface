import { useEffect, useState } from 'react';
import { logError } from '../../helpers/errorLogging';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

const useBlockTimestamp = (blockNumber: number) => {
  const [timestamp, setTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const {
    state: { provider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!provider) {
      setTimestamp(Math.floor(Date.now() / 1000));
      return;
    }

    provider
      .getBlock(blockNumber)
      .then(block => {
        if (!block) {
          return;
        }

        setTimestamp(block.timestamp);
      })
      .catch(logError);
  }, [provider, blockNumber]);

  return timestamp;
};

export default useBlockTimestamp;
