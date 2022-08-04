import { useEffect, useState } from 'react';
import {
  TreasuryModule,
  TreasuryModule__factory,
} from '../../../assets/typechain-types/module-treasury';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

const useTreasuryModuleContract = (moduleAddress: string | null) => {
  const [treasuryModule, setTreasuryModule] = useState<TreasuryModule>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!moduleAddress || !signerOrProvider) {
      setTreasuryModule(undefined);
      return;
    }
    setTreasuryModule(TreasuryModule__factory.connect(moduleAddress, signerOrProvider));
  }, [signerOrProvider, moduleAddress]);

  return treasuryModule;
};

export default useTreasuryModuleContract;
