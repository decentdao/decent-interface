import { useFractal } from '../providers/App/AppProvider';
import { formatCoin } from '../utils';
import { MOCK_MORALIS_ETH_ADDRESS } from '../utils/address';

export const useNativeToken = () => {
  const {
    treasury: { assetsFungible },
  } = useFractal();

  // @todo: Confirm this works for all networks
  const nativeToken = assetsFungible.find(
    asset =>
      !asset.tokenAddress ||
      asset.tokenAddress.toLowerCase() === MOCK_MORALIS_ETH_ADDRESS.toLowerCase(),
  );

  const formattedNativeTokenBalance = nativeToken
    ? formatCoin(nativeToken?.balance, true, nativeToken?.decimals, nativeToken?.symbol)
    : null;

  return {
    nativeToken,
    formattedNativeTokenBalance,
  };
};
