import { useEffect, useState, useCallback } from 'react';
import { useEthersProvider } from './useEthersProvider';

const useCurrentBlockNumber = () => {
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const provider = useEthersProvider();

  const updateBlockNumber = useCallback(
    (block: number) => {
      setCurrentBlockNumber(block);
      if (!isLoaded) {
        setIsLoaded(true);
      }
    },
    [isLoaded],
  );

  useEffect(() => {
    if (!provider) {
      setCurrentBlockNumber(undefined);
      return;
    }

    provider.on('block', updateBlockNumber);

    return () => {
      provider.off('block', updateBlockNumber);
    };
  }, [provider, updateBlockNumber]);

  return { currentBlockNumber, isLoaded };
};

export default useCurrentBlockNumber;
