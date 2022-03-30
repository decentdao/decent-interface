import { useState, useEffect } from 'react';

import { useWeb3 } from '../web3';
import {
  IERC165,
  IERC165__factory,
} from '../typechain-types';

const use165Contract = (address: string | undefined) => {
  const { signerOrProvider } = useWeb3();

  const [contract, setContract] = useState<IERC165>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    if (!signerOrProvider || !address || address.trim() === "") {
      setContract(undefined);
      setLoading(false);
      return;
    }

    setContract(IERC165__factory.connect(address, signerOrProvider));
    setLoading(false);
  }, [signerOrProvider, address]);

  return [contract, loading] as const;
}

export default use165Contract;
