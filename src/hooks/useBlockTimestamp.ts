import useBlockNumber from "./useBlockNumber";
import { useEffect, useState } from 'react';
import { useWeb3 } from "../web3";

const useBlockTimestamp = () => {
  const [blockTimestamp, setBlockTimestamp] = useState<number>();
  const { provider } = useWeb3();
  const blockNumber = useBlockNumber();

  useEffect(() => {
    if(provider === undefined || blockNumber === undefined) {
      setBlockTimestamp(undefined);
      return;
    }

    const timer = setInterval(() => {
      provider.getBlock(blockNumber)
      .then((block) => {
        setBlockTimestamp(block.timestamp)
      })
      .catch(console.error);
    }, 1000);
    return () => clearInterval(timer);
  }, [provider, blockNumber]);

  return blockTimestamp;
}

export default useBlockTimestamp;