import { useState, useEffect } from 'react';

import { IERC165, IERC165__factory } from '@fractal-framework/core-contracts';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';

const use165Contract = (address: string | undefined) => {
  const {
    state: { provider },
  } = useWeb3Provider();

  const [contract, setContract] = useState<IERC165>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    if (!provider || !address || address.trim() === '') {
      setContract(undefined);
      setLoading(false);
      return;
    }

    setContract(IERC165__factory.connect(address, provider));
    setLoading(false);
  }, [provider, address]);

  return [contract, loading] as const;
};

export default use165Contract;
