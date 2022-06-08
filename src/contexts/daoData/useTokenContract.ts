import { useState, useEffect } from 'react';
import {
  VotesTokenWithSupply,
  VotesTokenWithSupply__factory,
} from '../../assets/typechain-types/votes-token';
import { GovernorModule } from '../../assets/typechain-types/module-governor';
import { useWeb3 } from '../web3Data';

const useTokenContract = (governorModule: GovernorModule | undefined) => {
  const [tokenContract, setTokenContract] = useState<VotesTokenWithSupply>();
  const [{ signerOrProvider }] = useWeb3();

  useEffect(() => {
    if (!governorModule || !signerOrProvider) {
      setTokenContract(undefined);
      return;
    }

    governorModule
      .token()
      .then(tokenAddress =>
        setTokenContract(VotesTokenWithSupply__factory.connect(tokenAddress, signerOrProvider))
      )
      .catch(console.error);
  }, [governorModule, signerOrProvider]);

  return tokenContract;
};

export default useTokenContract;
