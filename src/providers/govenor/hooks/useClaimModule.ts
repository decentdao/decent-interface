import {
  TokenClaim,
  TokenClaim__factory,
} from '@fractal-framework/fractal-contracts/dist/typechain-types';
import { useEffect, useState } from 'react';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

const useClaimModule = (moduleAddress: string | undefined) => {
  const [claimModule, setClaimModule] = useState<TokenClaim>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!moduleAddress || !signerOrProvider) {
      setClaimModule(undefined);
      return;
    }

    setClaimModule(TokenClaim__factory.connect(moduleAddress, signerOrProvider));
  }, [moduleAddress, signerOrProvider]);

  return claimModule;
};

export default useClaimModule;
