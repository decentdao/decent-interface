import useBlockNumber from "./useCurrentBlockNumber";
import { useEffect, useState } from "react";
import { useWeb3 } from "../web3";

const useCurrentTimestamp = () => {
  const [blockTimestamp, setBlockTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const { provider } = useWeb3();
  const blockNumber = useBlockNumber();

  useEffect(() => {
    if (provider === undefined || blockNumber === undefined) {
      setBlockTimestamp(Math.floor(Date.now() / 1000));
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

export default useCurrentTimestamp;
