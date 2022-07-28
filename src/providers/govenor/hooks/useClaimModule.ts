import { useState, useEffect } from 'react';
import { IModuleBase__factory } from '@fractal-framework/core-contracts';
import {
  ClaimSubsidiary,
  IClaimSubsidiary__factory,
  ClaimSubsidiary__factory,
} from '../../../assets/typechain-types/votes-token';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import use165Contracts from './use165Contracts';
import useSupportsInterfaces from './useSupportsInterfaces';

const useClaimModule = (moduleAddresses: string[] | undefined) => {
  const [claimModule, setClaimModule] = useState<ClaimSubsidiary>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const [contracts] = use165Contracts(moduleAddresses);
  const [interfaces] = useState([
    IModuleBase__factory.createInterface(),
    IClaimSubsidiary__factory.createInterface(),
  ]);

  const [potentialClaim] = useSupportsInterfaces(contracts, interfaces);

  useEffect(() => {
    if (potentialClaim === undefined || !signerOrProvider) {
      setClaimModule(undefined);
      return;
    }

    const claim = potentialClaim.find(g => g.match === true);
    if (!claim) {
      setClaimModule(undefined);
      return;
    }

    setClaimModule(ClaimSubsidiary__factory.connect(claim.address, signerOrProvider));
  }, [potentialClaim, signerOrProvider]);

  return claimModule;
};

export default useClaimModule;
