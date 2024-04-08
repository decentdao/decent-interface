import { useMemo } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';

export function useTreasuryTotalBN(): bigint {
  const {
    treasury: { assetsFungible },
  } = useFractal();

  return useMemo(() => {
    return assetsFungible.reduce((prev, asset) => prev + BigInt(asset.balance), 0n);
  }, [assetsFungible]);
}
