import { useState, useEffect } from 'react';
import {
  Timelock,
  Timelock__factory,
  ITimelock__factory,
} from '../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';
import use165Contracts from '../../hooks/use165Contracts';
import useSupportsInterfaces from '../../hooks/useSupportsInterfaces';
import { IModuleBase__factory } from '@fractal-framework/core-contracts';

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
