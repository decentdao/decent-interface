import { useEffect, useState } from "react";
import { useWeb3 } from "../web3Data";

const useCurrentTimestamp = (blockNumber: number | undefined) => {
  const [timestamp, setTimestamp] = useState<number>(
    Math.floor(Date.now() / 1000)
  );
  const [{ provider }] = useWeb3();

  useEffect(() => {
    const timer = setInterval(() => setTimestamp((oldTimestamp) => oldTimestamp + 1), 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (provider === undefined || blockNumber === undefined) {
      setTimestamp(Math.floor(Date.now() / 1000));
      return;
    }

    provider
      .getBlock(blockNumber)
      .then((block) => {
        // sometimes block is null idk why
        if (!block) {
          return;
        }

        setTimestamp(block.timestamp);
      })
      .catch(console.error);
  }, [provider, blockNumber]);

  return timestamp;
};

export default useCurrentTimestamp;
