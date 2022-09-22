import { useEffect, useState } from 'react';
import { GnosisSafe__factory, GnosisSafe } from '../../../assets/typechain-types/gnosis-safe';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

const useGnosisSafe = (safeAddress?: string) => {
  const [gnosisSafe, setGnosisSafe] = useState<GnosisSafe>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!safeAddress || !signerOrProvider) {
      setGnosisSafe(undefined);
      return;
    }
    setGnosisSafe(GnosisSafe__factory.connect(safeAddress, signerOrProvider));
  }, [signerOrProvider, safeAddress]);

  return gnosisSafe;
};

export default useGnosisSafe;
