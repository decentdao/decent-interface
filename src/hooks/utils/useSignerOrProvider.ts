import { useMemo } from 'react';
import { useEthersProvider } from './useEthersProvider';
import { useEthersSigner } from './useEthersSigner';

export default function useSignerOrProvider() {
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  return signerOrProvider;
}
