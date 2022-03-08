import { useState, useEffect } from 'react';
import { useWeb3 } from '../web3';
import {
  IERC165,
  IERC165__factory,
} from '../typechain';

const use165Contract = (address: string | undefined) => {
  const { signerOrProvider } = useWeb3();

  const [contract, setContract] = useState<IERC165>();

  useEffect(() => {
    if (!signerOrProvider || !address || address.trim() === "") {
      setContract(undefined);
      return;
    }

    setContract(IERC165__factory.connect(address, signerOrProvider));
  }, [signerOrProvider, address]);

  return contract;
}

export default use165Contract;
