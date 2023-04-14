import { GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { useEffect, useMemo, useState } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { useFractal } from '../../providers/App/AppProvider';

export default function useDefaultNonce() {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const {
    node: { daoAddress },
  } = useFractal();

  const [defaultNonce, setDefaultNonce] = useState<number>();

  useEffect(() => {
    if (!daoAddress) {
      setDefaultNonce(undefined);
      return;
    }

    const gnosisSafeContract = GnosisSafe__factory.connect(daoAddress, signerOrProvider);

    gnosisSafeContract.nonce().then(_nonce => setDefaultNonce(_nonce.toNumber()));
  }, [daoAddress, signerOrProvider]);

  return defaultNonce;
}
