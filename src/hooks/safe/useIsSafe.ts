import { isAddress } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { useFractal } from './../../providers/Fractal/hooks/useFractal';

const useIsGnosisSafe = (address: string | undefined) => {
  const [loading, setLoading] = useState<boolean>();
  const [isSafe, setIsSafe] = useState<boolean>();

  const {
    gnosis: { safeService },
  } = useFractal();

  useEffect(() => {
    if (!address || !isAddress(address) || !safeService) {
      setIsSafe(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    safeService
      .getSafeCreationInfo(address)
      .then(() => setIsSafe(true))
      .catch(() => setIsSafe(false))
      .finally(() => setLoading(false));
  }, [address, safeService]);

  return [isSafe, loading] as const;
};

export default useIsGnosisSafe;
