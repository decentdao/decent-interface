import { useEffect, useState } from 'react';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

const useCurrentBlockNumber = () => {
  const [blockNumber, setBlockNumber] = useState<number>();
  const {
    state: { provider },
  } = useWeb3Provider();

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
