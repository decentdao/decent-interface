import { useState, useEffect } from 'react';

import {
  GovernorModule,
  GovernorModule__factory,
} from '../../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

const useGovernorModuleContract = (moduleAddress: string | null) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!moduleAddress || !signerOrProvider) {
      setGovernorModule(undefined);
      return;
    }

    setGovernorModule(GovernorModule__factory.connect(moduleAddress, signerOrProvider));
  }, [moduleAddress, signerOrProvider]);

  return governorModule;
};

export default useGovernorModuleContract;
