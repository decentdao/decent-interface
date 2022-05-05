import { useState, useEffect } from 'react';

import { useWeb3 } from '../contexts/web3Data';

const useENSName = (account: string | undefined) => {
  const [{ provider }] = useWeb3();

  const [ensName, setEnsName] = useState<string | null>(null);
  useEffect(() => {
    if (!provider || !account) {
      setEnsName(null);
      return;
    }

    provider.lookupAddress(account)
      .then(setEnsName)
      .catch(console.error);
  }, [account, provider]);

  return ensName;
}

export default useENSName;
