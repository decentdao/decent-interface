import { useMemo } from 'react';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { formatUSD } from '../../../utils/numberFormats';

export function useTreasuryTotalUSD(): string {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  return useMemo(() => {
    return formatUSD(
      assetsFungible.reduce((prev, asset) => (prev += Number(asset.fiatBalance)), 0)
    );
  }, [assetsFungible]);
}
