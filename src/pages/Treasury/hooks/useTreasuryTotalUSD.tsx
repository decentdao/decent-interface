import { useMemo } from 'react';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import { formatUSD } from '../../../utils/numberFormats';

export function useTreasuryTotalUSD(): string {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  return useMemo(() => {
    let totalUSD = 0;
    assetsFungible.forEach(asset => (totalUSD += Number(asset.fiatBalance)));
    return formatUSD(totalUSD);
  }, [assetsFungible]);
}
