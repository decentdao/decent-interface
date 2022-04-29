import { useEffect, useState } from 'react';
import { useWeb3 } from "../web3";

const useBlockNumber = () => {
  const [blockNumber, setBlockNumber] = useState<number>();
  const { provider } = useWeb3();

  useEffect(() => {
    if(provider === undefined) {
      setBlockNumber(undefined);
      return;
    }

    const timer = setInterval(() => {
      provider.getBlockNumber()
      .then((blockNumber) => {
        setBlockNumber(blockNumber)
      })
      .catch(console.error);
    }, 1000);
    return () => clearInterval(timer);
  }, [provider]);

  return blockNumber;
}

export default useBlockNumber;