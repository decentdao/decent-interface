import { TreasuryContext } from './hooks/useTreasuryModule';

import { ReactNode, useMemo } from 'react';
import useTreasuryAssetsFungible from './hooks/useTreasuryAssetsFungible';
import useTreasuryAssetsFungibleFiatAmounts from './hooks/useTreasuryAssetsFungibleFiatAmounts';
import useTreasuryAssetsFungiblePrices from './hooks/useTreasuryAssetsFungiblePrices';
import useTreasuryAssetsNonFungible from './hooks/useTreasuryAssetsNonFungible';
import useTreasuryEvents from './hooks/useTreasuryEvents';
import useTreasuryModuleContract from './hooks/useTreasuryModuleContract';

export function TreasuryModuleProvider({
  moduleAddress,
  children,
}: {
  moduleAddress: string | null;
  children: ReactNode;
}) {
  const treasuryModuleContract = useTreasuryModuleContract(moduleAddress);

  const {
    nativeDeposits,
    nativeWithdraws,
    erc20TokenDeposits,
    erc20TokenWithdraws,
    erc721TokenDeposits,
    erc721TokenWithdraws,
  } = useTreasuryEvents(treasuryModuleContract);

  const treasuryAssetsFungible = useTreasuryAssetsFungible(
    nativeDeposits,
    nativeWithdraws,
    erc20TokenDeposits,
    erc20TokenWithdraws
  );

  // TODO: where should this live?
  // it might be useful to present a "currencies"
  // option to select a currency in a future iteration.
  const selectedCurrency = 'usd';

  const treasuryAssetsFungiblePrices = useTreasuryAssetsFungiblePrices(
    treasuryAssetsFungible,
    selectedCurrency,
    nativeDeposits
  );

  const treasuryAssetsFungibleFiatAmounts = useTreasuryAssetsFungibleFiatAmounts(
    treasuryAssetsFungible,
    treasuryAssetsFungiblePrices,
    selectedCurrency
  );

  const treasuryAssetsNonFungible = useTreasuryAssetsNonFungible(
    erc721TokenDeposits,
    erc721TokenWithdraws
  );

  const value = useMemo(
    () => ({
      selectedCurrency,
      treasuryModuleContract,
      treasuryAssetsFungible,
      treasuryAssetsFungiblePrices,
      treasuryAssetsFungibleFiatAmounts,
      treasuryAssetsNonFungible,
    }),
    [
      selectedCurrency,
      treasuryModuleContract,
      treasuryAssetsFungible,
      treasuryAssetsFungiblePrices,
      treasuryAssetsFungibleFiatAmounts,
      treasuryAssetsNonFungible,
    ]
  );

  return <TreasuryContext.Provider value={value}>{children}</TreasuryContext.Provider>;
}
