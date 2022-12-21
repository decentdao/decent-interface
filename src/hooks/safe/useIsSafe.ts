import axios from 'axios';
import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { buildGnosisApiUrl } from '../../providers/Fractal/utils/api';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

export const useIsGnosisSafe = (address: string | undefined) => {
  const [isSafeLoading, setSafeLoading] = useState<boolean>(false);
  const [isSafe, setIsSafe] = useState<boolean>();
  const {
    state: { chainId },
  } = useWeb3Provider();

  useEffect(() => {
    setSafeLoading(true);
    setIsSafe(undefined);

    if (!address || !isAddress(address)) {
      setIsSafe(false);
      setSafeLoading(false);
      return;
    }

    axios
      .get(buildGnosisApiUrl(chainId, `/safes/${address}`))
      .then(() => setIsSafe(true))
      .catch(() => setIsSafe(false))
      .finally(() => setSafeLoading(false));
  }, [address, chainId]);

  return { isSafe, isSafeLoading };
};
