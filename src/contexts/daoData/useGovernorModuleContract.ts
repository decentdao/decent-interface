import { useState, useEffect } from 'react';
import {
  GovernorModule,
  GovernorModule__factory,
  IGovernorModule__factory,
} from '../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';
import use165Contracts from '../../hooks/use165Contracts';
import useSupportsInterfaces from '../../hooks/useSupportsInterfaces';
import { IModuleBase__factory } from '@fractal-framework/core-contracts';

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
