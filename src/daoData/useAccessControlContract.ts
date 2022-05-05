import { useState, useEffect } from 'react';
import { AccessControl, AccessControl__factory } from '../typechain-types';
import { useWeb3 } from '../web3Data';

const useAccessControlContract = (accessControlAddress: string | undefined) => {
  const [accessControlContract, setAccessControlContract] = useState<AccessControl>();
  const [{ signerOrProvider }] = useWeb3();

  useEffect(() => {
    if(!accessControlAddress || !signerOrProvider) {
      setAccessControlContract(undefined);
      return;
    }

    setAccessControlContract(AccessControl__factory.connect(accessControlAddress, signerOrProvider));
  }, [accessControlAddress, signerOrProvider]);

  return accessControlContract;
}

export default useAccessControlContract;
