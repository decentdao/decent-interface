import { useState, useEffect } from 'react';

import { IModuleBase__factory } from '@fractal-framework/core-contracts';
import {
  GovernorModule,
  IGovernorModule__factory,
  GovernorModule__factory,
} from '../../../assets/typechain-types/metafactory';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import use165Contracts from './use165Contracts';
import useSupportsInterfaces from './useSupportsInterfaces';

const useGovernorModuleContract = (moduleAddresses: string[] | undefined) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const [contracts] = use165Contracts(moduleAddresses);
  const [interfaces] = useState([
    IModuleBase__factory.createInterface(),
    IGovernorModule__factory.createInterface(),
  ]);

  const [potentialGovernors] = useSupportsInterfaces(contracts, interfaces);

  useEffect(() => {
    if (potentialGovernors === undefined || !signerOrProvider) {
      setGovernorModule(undefined);
      return;
    }

    const governor = potentialGovernors.find(g => g.match === true);
    if (governor === undefined) {
      setGovernorModule(undefined);
      return;
    }

    setGovernorModule(GovernorModule__factory.connect(governor.address, signerOrProvider));
  }, [potentialGovernors, signerOrProvider]);

  return governorModule;
};

export default useGovernorModuleContract;
