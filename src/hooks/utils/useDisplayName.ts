import { useEffect, useState } from 'react';
import { Address, useEnsName } from 'wagmi';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';

export const createAccountSubstring = (account: string) => {
  return `${account.substring(0, 6)}...${account.slice(-4)}`;
};

/**
 * Gets the 'display name' of an Ethereum address, by first checking if there is a corresponding
 * Primary ENS Name (reverse record), otherwise returning a truncated address in the form
 * 0xbFC4...7551
 *
 * This is intended to be used for NON Fractal DAO display names.  If you would like to get the
 * display name for a Fractal DAO, use the useDAOName hook instead.
 */
const useDisplayName = (account?: string | null, truncate?: boolean) => {
  if (truncate === undefined) truncate = true;
  const provider = useEthersProvider();
  const networkId = provider.network.chainId;
  const { data: ensName } = useEnsName({
    address: account as Address,
    chainId: networkId,
    cacheTime: 1000 * 60 * 30, // 30 min
  });

  const [accountSubstring, setAccountSubstring] = useState<string>();
  useEffect(() => {
    if (!account) {
      setAccountSubstring(undefined);
      return;
    }

    setAccountSubstring(createAccountSubstring(account));
  }, [account]);

  const [displayName, setDisplayName] = useState<string>('');
  useEffect(() => {
    if (!accountSubstring || !account) {
      setDisplayName('');
      return;
    }

    if (!ensName) {
      setDisplayName(truncate ? accountSubstring : account);
      return;
    }

    setDisplayName(ensName);
  }, [account, accountSubstring, ensName, truncate]);

  return { displayName, accountSubstring };
};

export default useDisplayName;
