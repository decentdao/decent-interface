import { useEffect, useState } from 'react';
import {
  TreasuryModule,
  TreasuryModule__factory,
  ITreasuryModule__factory,
} from '../../../assets/typechain-types/module-treasury';
import { useWeb3Provider } from '../../web3Data/hooks/useWeb3Provider';
import use165Contracts from '../../../hooks/use165Contracts';
import useSupportsInterfaces from '../../../hooks/useSupportsInterfaces';
import { IModuleBase__factory } from '@fractal-framework/core-contracts';

const useTreasuryModuleContract = (moduleAddresses: string[] | undefined) => {
  const [treasuryModule, setTreasuryModule] = useState<TreasuryModule>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const [contracts] = use165Contracts(moduleAddresses);
  const [interfaces] = useState([
    IModuleBase__factory.createInterface(),
    ITreasuryModule__factory.createInterface(),
  ]);

  const [potentialTreasuries] = useSupportsInterfaces(contracts, interfaces);

  useEffect(() => {
    if (potentialTreasuries === undefined || !signerOrProvider) {
      setTreasuryModule(undefined);
      return;
    }

    const treasury = potentialTreasuries.find(t => t.match === true);
    if (treasury === undefined) {
      setTreasuryModule(undefined);
      return;
    }

    setTreasuryModule(TreasuryModule__factory.connect(treasury.address, signerOrProvider));
  }, [potentialTreasuries, signerOrProvider, moduleAddresses]);

  return treasuryModule;
};

export default useTreasuryModuleContract;
