import { IERC165, IERC165__factory } from '@fractal-framework/core-contracts';
import { useEffect, useState } from 'react';

import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

const use165Contracts = (addresses: string[] | undefined) => {
  const {
    state: { provider },
  } = useWeb3Provider();

  const [contracts, setContracts] = useState<IERC165[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    if (!provider || !addresses) {
      setContracts(undefined);
      setLoading(false);
      return;
    }

    setContracts(addresses.map(address => IERC165__factory.connect(address, provider)));
    setLoading(false);
  }, [provider, addresses]);

  return [contracts, loading] as const;
};

export default use165Contracts;
