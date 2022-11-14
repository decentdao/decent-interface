import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import { formatUSD } from '../../../utils/numberFormats';

export function useTreasuryTotalUSD(): string {
  const {
    treasury: { assetsFungible },
  } = useFractal();
  let totalUSD = 0;
  assetsFungible.map(asset => (totalUSD += Number(asset.fiatBalance)));
  return formatUSD(totalUSD);
}
