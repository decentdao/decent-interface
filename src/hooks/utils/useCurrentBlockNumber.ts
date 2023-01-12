import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';

const useCurrentBlockNumber = () => {
  const [blockNumber, setBlockNumber] = useState<number>();
  const provider = useProvider();

  useEffect(() => {
    if (!provider) {
      setBlockNumber(undefined);
      return;
    }

    const updateBlockNumber = (block: number) => {
      setBlockNumber(block);
    };

    provider.on('block', updateBlockNumber);

    return () => {
      provider.off('block', updateBlockNumber);
    };
  }, [provider]);

  return blockNumber;
};

export default useCurrentBlockNumber;
