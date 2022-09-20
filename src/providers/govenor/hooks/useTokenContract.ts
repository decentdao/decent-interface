import { useState, useEffect } from 'react';
import {
  GovernorModule,
  VotesToken,
  VotesToken__factory,
} from '../../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../../helpers/errorlogging';

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
      .catch(logError);
  }, [governorModule, signerOrProvider]);

  return tokenContract;
};

export default useTokenContract;
