import { useEffect, useState } from 'react';

import use165Contracts from './use165Contracts';
import { IDAO__factory, IModuleBase__factory } from '@fractal-framework/core-contracts';
import useSupportsInterfaces from './useSupportsInterfaces';

const useIsDAO = (address: string | undefined) => {
  const [potentialDAOContract, setPotentialDAOContract] = useState<string[]>();
  useEffect(() => {
    if (address === undefined) {
      setPotentialDAOContract(undefined);
      return;
    }

    setPotentialDAOContract([address]);
  }, [address]);

  const [contracts, contractsLoading] = use165Contracts(potentialDAOContract);
  const [interfaces] = useState([
    IModuleBase__factory.createInterface(),
    IDAO__factory.createInterface(),
  ]);
  const [isDAO, isDAOLoading] = useSupportsInterfaces(contracts, interfaces);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(contractsLoading || isDAOLoading);
  }, [contractsLoading, isDAOLoading]);

  if (isDAO === undefined) {
    return [undefined, loading] as const;
  }

  return [isDAO[0].match, loading] as const;
};

export default useIsDAO;
