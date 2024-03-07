import { useMemo } from 'react';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { useEthersSigner } from '../../providers/Ethers/hooks/useEthersSigner';

export default function useSignerOrProvider() {
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  return signerOrProvider;
}
