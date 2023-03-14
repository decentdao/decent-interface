import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { useEffect, useMemo, useState } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';

export default function useDefaultNonce() {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const {
    gnosis: { safe },
  } = useFractal();

  const [defaultNonce, setDefaultNonce] = useState<number>();

  useEffect(() => {
    if (!safe.address) {
      setDefaultNonce(undefined);
      return;
    }

    const gnosisSafeContract = GnosisSafe__factory.connect(safe.address, signerOrProvider);

    gnosisSafeContract.nonce().then(_nonce => setDefaultNonce(_nonce.toNumber()));
  }, [safe.address, signerOrProvider]);

  return defaultNonce;
}
