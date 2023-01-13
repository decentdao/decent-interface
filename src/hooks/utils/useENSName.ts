import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { logError } from '../../helpers/errorLogging';

const useENSName = (account?: string | null) => {
  const provider = useProvider();

  const [ensName, setEnsName] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    if (!provider || !account || !isAddress(account)) {
      setEnsName(null);
      return;
    }

    provider
      .lookupAddress(account)
      .then((value: string | null) => {
        if (isMounted) {
          setEnsName(value);
        }
      })
      .catch(logError);
    return () => {
      isMounted = false;
    };
  }, [account, provider]);

  return ensName;
};

export default useENSName;
