import { useState, useEffect } from 'react';
import { AccessControlDAO, AccessControlDAO__factory } from '@fractal-framework/core-contracts';
import { useWeb3 } from '../web3Data';

const useAccessControlContract = (accessControlAddress: string | undefined) => {
  const [accessControlContract, setAccessControlContract] = useState<AccessControlDAO>();
  const [{ signerOrProvider }] = useWeb3();

  useEffect(() => {
    if (!accessControlAddress || !signerOrProvider) {
      setAccessControlContract(undefined);
      return;
    }

    setAccessControlContract(
      AccessControlDAO__factory.connect(accessControlAddress, signerOrProvider)
    );
  }, [accessControlAddress, signerOrProvider]);

  return accessControlContract;
};

export default useAccessControlContract;
