import { useEffect, useState } from 'react';
import {
  GnosisWrapper,
  GnosisWrapper__factory,
} from '../../../assets/typechain-types/gnosis-wrapper';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

const useGnosisWrapperContract = (moduleAddress: string | null) => {
  const [gnosisWrapper, setGnosisWrapper] = useState<GnosisWrapper>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!moduleAddress || !signerOrProvider) {
      setGnosisWrapper(undefined);
      return;
    }
    setGnosisWrapper(GnosisWrapper__factory.connect(moduleAddress, signerOrProvider));
  }, [signerOrProvider, moduleAddress]);

  return gnosisWrapper;
};

export default useGnosisWrapperContract;
