import { useState, useEffect } from 'react';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

function useGnosisSafeLink(address: string | undefined) {
  let {
    state: { chainId },
  } = useWeb3Provider();
  const [chainString, setChainString] = useState<string>();
  const [gnosisSafeLink, setGnosisSafeLink] = useState<string>();

  useEffect(() => {
    if (!chainId) {
      setChainString(undefined);
      return;
    }

    if (chainId === 1) {
      setChainString('eth');
    } else if (chainId === 420) {
      setChainString('gor');
    }
  }, [chainId]);

  useEffect(() => {
    if (!chainString || !address) {
      setGnosisSafeLink(undefined);
      return;
    }

    setGnosisSafeLink(`https://gnosis-safe.io/app/${chainString}/${address}/home`);
  }, [address, chainString]);

  return gnosisSafeLink;
}

export default useGnosisSafeLink;
