import { useEffect, useState } from 'react';
import {
  ClaimSubsidiary,
  ClaimSubsidiary__factory,
} from '../../../assets/typechain-types/votes-token';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

const useClaimModule = (moduleAddress: string | undefined) => {
  const [claimModule, setClaimModule] = useState<ClaimSubsidiary>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!moduleAddress || !signerOrProvider) {
      setClaimModule(undefined);
      return;
    }

    setClaimModule(ClaimSubsidiary__factory.connect(moduleAddress, signerOrProvider));
  }, [moduleAddress, signerOrProvider]);

  return claimModule;
};

export default useClaimModule;
