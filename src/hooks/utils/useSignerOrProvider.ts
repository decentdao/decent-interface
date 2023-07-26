import { useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';

export default function useSignerOrProvider() {
  const { data: signer } = useSigner();
  const provider = useProvider();

  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  return signerOrProvider;
}
