import { useState, useEffect } from 'react';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';
import { MetaFactory, MetaFactory__factory } from '../../assets/typechain-types/metafactory';
import { useAddresses } from '../daoData/useAddresses';

const useMetaFactoryContract = () => {
  const [metaFactoryContract, setMetaFactoryContract] = useState<MetaFactory>();
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const { metaFactory } = useAddresses(chainId);

  useEffect(() => {
    if (!metaFactory || !signerOrProvider) {
      setMetaFactoryContract(undefined);
      return;
    }

    setMetaFactoryContract(MetaFactory__factory.connect(metaFactory.address, signerOrProvider));
  }, [metaFactory, signerOrProvider]);

  return metaFactoryContract;
};

export default useMetaFactoryContract;
