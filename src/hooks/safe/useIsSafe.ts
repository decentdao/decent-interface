import axios from 'axios';
import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { buildGnosisApiUrl } from '../../providers/Fractal/utils/api';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

/**
 * A hook which determines whether the provided Ethereum address is a Gnosis
 * Safe smart contract address on the currently connected chain (chainId).
 *
 * The state can be either true/false or undefined, if a network call is currently
 * being performed to determine that status.
 *
 * @param address the address to check
 * @returns isSafe: whether the address is a Safe,
 *  isSafeLoading: true/false whether the isSafe status is still being determined
 */
export const useIsGnosisSafe = (address: string | undefined) => {
  const [isSafeLoading, setSafeLoading] = useState<boolean>(false);
  const [isSafe, setIsSafe] = useState<boolean | undefined>();
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
