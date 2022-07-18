import { useState, useEffect } from 'react';

import { IModuleBase__factory } from '@fractal-framework/core-contracts';
import {
  Timelock,
  ITimelock__factory,
  Timelock__factory,
} from '../../../assets/typechain-types/metafactory';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import use165Contracts from './use165Contracts';
import useSupportsInterfaces from './useSupportsInterfaces';

const useTimelockModuleContract = (moduleAddresses: string[] | undefined) => {
  const [timelockControllerModule, setTimelockControllerModule] = useState<Timelock>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const [contracts] = use165Contracts(moduleAddresses);
  const [interfaces] = useState([
    IModuleBase__factory.createInterface(),
    ITimelock__factory.createInterface(),
  ]);

  const [potentialTimelocks] = useSupportsInterfaces(contracts, interfaces);

  useEffect(() => {
    if (potentialTimelocks === undefined || !signerOrProvider) {
      setTimelockControllerModule(undefined);
      return;
    }

    const timelock = potentialTimelocks.find(g => g.match === true);
    if (timelock === undefined) {
      setTimelockControllerModule(undefined);
      return;
    }

    setTimelockControllerModule(Timelock__factory.connect(timelock.address, signerOrProvider));
  }, [potentialTimelocks, signerOrProvider]);

  return timelockControllerModule;
};

export default useTimelockModuleContract;
