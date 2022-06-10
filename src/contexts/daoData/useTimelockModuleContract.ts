import { useState, useEffect } from 'react';
import {
  TimelockUpgradeable,
  TimelockUpgradeable__factory,
} from '../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';

const useTimelockModuleContract = (moduleAddresses: string[] | undefined) => {
  const [timelockModule, setTimelockModule] = useState<TimelockUpgradeable>();
  const {
    state: { provider },
  } = useWeb3Provider();

  useEffect(() => {
    if (moduleAddresses === undefined || moduleAddresses[2] === undefined || !provider) {
      setTimelockModule(undefined);
      return;
    }

    setTimelockModule(TimelockUpgradeable__factory.connect(moduleAddresses[2], provider));
  }, [moduleAddresses, provider]);

  return timelockModule;
};

export default useTimelockModuleContract;
