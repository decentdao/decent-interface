import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';

const GNOSIS_CHAINS: { [key: string]: string } = {
  '1': 'eth',
  '4': 'rin',
  '5': 'gor',
};

function useGnosisSafeLink(address: string | undefined) {
  const provider = useProvider();
  const [gnosisSafeLink, setGnosisSafeLink] = useState<string>();

  useEffect(() => {
    if (!address) {
      setGnosisSafeLink(undefined);
      return;
    }

    setGnosisSafeLink(
      `https://gnosis-safe.io/app/${
        GNOSIS_CHAINS[provider._network.chainId.toString()]
      }:${address}/home`
    );
  }, [address, provider]);

  return gnosisSafeLink;
}

export default useGnosisSafeLink;
