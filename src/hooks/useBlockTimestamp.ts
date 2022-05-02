import useBlockNumber from "./useBlockNumber";
import { useEffect, useState } from "react";
import { useWeb3 } from "../web3";

const useBlockTimestamp = () => {
  const [blockTimestamp, setBlockTimestamp] = useState<number>(Date.now() / 1000);
  const { provider } = useWeb3();
  const blockNumber = useBlockNumber();

  useEffect(() => {
    if (provider === undefined || blockNumber === undefined) {
      setBlockTimestamp(Date.now() / 1000);
      return;
    }

    provider
      .getBlock(blockNumber)
      .then((block) => {
        setBlockTimestamp(block.timestamp);
      })
      .catch(console.error);
  }, [provider, blockNumber]);

  return blockTimestamp;
};

export default useBlockTimestamp;
