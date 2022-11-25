import { useEffect, useState } from 'react';
import { logError } from '../../helpers/errorLogging';
import { useWeb3Provider } from '../../providers/web3Data/hooks/useWeb3Provider';

const useENSName = (account?: string | null) => {
  const {
    state: { provider },
  } = useWeb3Provider();

  const [ensName, setEnsName] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    if (!provider || !account) {
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
