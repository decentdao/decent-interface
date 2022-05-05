import { useEffect, useState } from "react";
import { useWeb3 } from "../web3Data";

const useCurrentBlockNumber = () => {
  const [blockNumber, setBlockNumber] = useState<number>();
  const [{ provider }] = useWeb3();

  useEffect(() => {
    if (provider === undefined) {
      setBlockNumber(undefined);
      return;
    }

    const updateBlockNumber = (blockNumber: number) => {
      setBlockNumber(blockNumber);
    }

    provider.on("block", updateBlockNumber);

    return () => {
      provider.off("block", updateBlockNumber);
    };
  }, [provider]);

  return blockNumber;
};

export default useCurrentBlockNumber;
