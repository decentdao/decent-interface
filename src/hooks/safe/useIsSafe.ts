import { useEffect, useState } from 'react';
import { isAddress } from 'viem';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';

/**
 * A hook which determines whether the provided Ethereum address is a Safe
 * smart contract address on the currently connected chain (chainId).
 *
 * The state can be either true/false or undefined, if a network call is currently
 * being performed to determine that status.
 *
 * @param address the address to check
 * @returns isSafe: whether the address is a Safe,
 *  isSafeLoading: true/false whether the isSafe status is still being determined
 */
export const useIsSafe = (address: string | undefined) => {
  const [isSafeLoading, setSafeLoading] = useState<boolean>(false);
  const [isSafe, setIsSafe] = useState<boolean | undefined>();
  const safeAPI = useSafeAPI();

  useEffect(() => {
    setSafeLoading(true);
    setIsSafe(undefined);

    if (!address || !isAddress(address) || !safeAPI) {
      setIsSafe(false);
      setSafeLoading(false);
      return;
    }

    safeAPI
      .getSafeCreationInfo(address)
      .then(() => setIsSafe(true))
      .catch(() => setIsSafe(false))
      .finally(() => setSafeLoading(false));
  }, [address, safeAPI]);

  return { isSafe, isSafeLoading };
};
