import { useState, useEffect } from 'react';

import { DAO, DAO__factory } from '@fractal-framework/core-contracts';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';

const useDAOContract = (address: string | undefined) => {
  const [dao, setDAO] = useState<DAO>();
  const {
    state: { provider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!address || !provider) {
      setDAO(undefined);
      return;
    }

    setDAO(DAO__factory.connect(address, provider));
  }, [address, provider]);

  return dao;
};

export default useDAOContract;
