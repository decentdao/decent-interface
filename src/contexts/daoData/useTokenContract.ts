import { useState, useEffect } from 'react';
import { VotesToken, VotesToken__factory } from '../../assets/typechain-types/votes-token';
import { GovernorModule } from '../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';

const useTokenContract = (governorModule: GovernorModule | undefined) => {
  const [tokenContract, setTokenContract] = useState<VotesToken>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!governorModule || !signerOrProvider) {
      setTokenContract(undefined);
      return;
    }

    governorModule
      .token()
      .then(tokenAddress =>
        setTokenContract(VotesToken__factory.connect(tokenAddress, signerOrProvider))
      )
      .catch(console.error);
  }, [governorModule, signerOrProvider]);

  return tokenContract;
};

export default useTokenContract;
