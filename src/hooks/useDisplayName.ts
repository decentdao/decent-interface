import { useState, useEffect } from 'react';

import useENSName from './useENSName';

export const createAccountSubstring = (account: string) => {
  return `${account.substring(0, 6)}...${account.slice(-4)}`;
}

const useDisplayName = (account: string | undefined) => {
  const ensName = useENSName(account);

  const [accountSubstring, setAccountSubstring] = useState<string>();
  useEffect(() => {
    if (!account) {
      setAccountSubstring(undefined);
      return;
    }

    setAccountSubstring(createAccountSubstring(account))
  }, [account]);

  const [displayName, setDisplayName] = useState<string>("");
  useEffect(() => {
    if (!accountSubstring) {
      setDisplayName("");
      return;
    }

    if (!ensName) {
      setDisplayName(accountSubstring);
      return;
    }

    setDisplayName(ensName);
  }, [accountSubstring, ensName]);

  return displayName;
}

export default useDisplayName;
