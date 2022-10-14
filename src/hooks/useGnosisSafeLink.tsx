import { useState, useEffect } from 'react';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

const GNOSIS_CHAINS: { [key: string]: string } = {
  '1': 'eth',
  '4': 'rin',
  '5': 'gor',
};

function useGnosisSafeLink(address: string | undefined) {
  let {
    state: { chainId },
  } = useWeb3Provider();
  const [gnosisSafeLink, setGnosisSafeLink] = useState<string>();

  useEffect(() => {
    if (!chainId || !address) {
      setGnosisSafeLink(undefined);
      return;
    }

    setGnosisSafeLink(
      `https://gnosis-safe.io/app/${GNOSIS_CHAINS[chainId.toString()]}:${address}/home`
    );
  }, [address, chainId]);

  return gnosisSafeLink;
}

export default useGnosisSafeLink;
