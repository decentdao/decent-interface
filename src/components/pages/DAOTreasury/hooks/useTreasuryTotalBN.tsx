import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';

export function useTreasuryTotalBN(): BigNumber {
  const {
    treasury: { assetsFungible },
  } = useFractal();

  return useMemo(() => {
    return assetsFungible.reduce((prev, asset) => prev.add(asset.balance), BigNumber.from(0));
  }, [assetsFungible]);
}
