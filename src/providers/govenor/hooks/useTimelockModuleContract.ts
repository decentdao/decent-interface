import { useState, useEffect } from 'react';

import { Timelock, Timelock__factory } from '../../../assets/typechain-types/metafactory';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

const useTimelockModuleContract = (moduleAddress: string | undefined) => {
  const [timelockControllerModule, setTimelockControllerModule] = useState<Timelock>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!moduleAddress || !signerOrProvider) {
      setTimelockControllerModule(undefined);
      return;
    }

    setTimelockControllerModule(Timelock__factory.connect(moduleAddress, signerOrProvider));
  }, [moduleAddress, signerOrProvider]);

  return timelockControllerModule;
};

export default useTimelockModuleContract;
