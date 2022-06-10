import { useEffect, useState } from 'react';
import {
  TreasuryModule,
  TreasuryModule__factory,
} from '../../../assets/typechain-types/module-treasury';
import { useWeb3Provider } from '../../web3Data/hooks/useWeb3Provider';

const useTreasuryModuleContract = (moduleAddresses?: string[]) => {
  const {
    state: { provider },
  } = useWeb3Provider();
  const [treasuryModule, setTreasuryModule] = useState<TreasuryModule>();

  useEffect(() => {
    if (
      moduleAddresses === undefined ||
      !moduleAddresses.length ||
      !moduleAddresses[0] ||
      !provider
    ) {
      setTreasuryModule(undefined);
      return;
    }
    setTreasuryModule(TreasuryModule__factory.connect(moduleAddresses[0], provider));
  }, [moduleAddresses, provider]);
  return treasuryModule;
};

export default useTreasuryModuleContract;
