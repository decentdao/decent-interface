import { useEffect, useState, useCallback } from 'react';
import { usePublicClient } from 'wagmi';

const useCurrentBlockNumber = () => {
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const publicClient = usePublicClient();

  const updateBlockNumber = useCallback(
    (block: bigint) => {
      setCurrentBlockNumber(Number(block));
      if (!isLoaded) {
        setIsLoaded(true);
      }
    },
    [isLoaded],
  );

  useEffect(() => {
    if (!publicClient) {
      setCurrentBlockNumber(undefined);
      return;
    }

    const unsubscribe = publicClient.watchBlockNumber({ onBlockNumber: updateBlockNumber });

    return () => {
      unsubscribe();
    };
  }, [publicClient, updateBlockNumber]);

  return { currentBlockNumber, isLoaded };
};

export default useCurrentBlockNumber;
