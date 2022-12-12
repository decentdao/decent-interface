import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { constants } from 'ethers';
import { useCallback } from 'react';

// TODO create send assets proposal
const useSendAssets = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  normalizedBalance,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asset,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  destinationAddress,
}: {
  normalizedBalance: string;
  asset: SafeBalanceUsdResponse;
  destinationAddress: string;
}) => {
  const rawBalance =
    Number(normalizedBalance) * (10 ^ (asset?.token?.decimals ? asset.token.decimals : 18));
  const tokenAddress = asset.tokenAddress ? asset.tokenAddress : constants.AddressZero;

  console.log('useSendAssets rawBalance: ' + rawBalance);
  console.log('useSendAssets tokenAddress ' + tokenAddress);
  console.log('useSendAssets destinationAddress ' + destinationAddress);

  const sendAssets = useCallback(() => {}, []);
  return sendAssets;
};

export default useSendAssets;
