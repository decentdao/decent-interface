import { useMemo } from 'react';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import useSignerOrProvider from '../utils/useSignerOrProvider';

export default function useSafeContracts() {
  const signerOrProvider = useSignerOrProvider();
  const provider = useEthersProvider();

  const daoContracts = useMemo(() => {
    if (!signerOrProvider || !provider) {
      return;
    }

    return {};
  }, [, signerOrProvider, provider]);

  return daoContracts;
}
