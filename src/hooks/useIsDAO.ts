import { useEffect, useState } from 'react';

import use165Contract from './use165Contract';
import { IDAO__factory, IModuleBase__factory } from '@fractal-framework/core-contracts';
import useSupportsInterfaces from './useSupportsInterfaces';

const useIsDAO = (address: string | undefined) => {
  const [contract, contractLoading] = use165Contract(address);
  const [interfaces] = useState([
    IDAO__factory.createInterface(),
    IModuleBase__factory.createInterface(),
  ]);
  const [isDAO, isDAOLoading] = useSupportsInterfaces(contract, interfaces);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(contractLoading || isDAOLoading);
  }, [contractLoading, isDAOLoading]);

  return [isDAO, loading] as const;
};

export default useIsDAO;
