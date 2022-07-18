import { TreasuryContext } from './hooks/useTreasuryModule';

import { ReactNode, useMemo } from 'react';
import useTreasuryAssetsFungible from './hooks/useTreasuryAssetsFungible';
import useTreasuryAssetsNonFungible from './hooks/useTreasuryAssetsNonFungible';
import useTreasuryEvents from './hooks/useTreasuryEvents';
import useTreasuryModuleContract from './hooks/useTreasuryModuleContract';

export function TreasuryModuleProvider({
  moduleAddresses,
  children,
}: {
  moduleAddresses: string[];
  children: ReactNode;
}) {
  const treasuryModuleContract = useTreasuryModuleContract(moduleAddresses);
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

  const treasuryAssetsNonFungible = useTreasuryAssetsNonFungible(
    erc721TokenDeposits,
    erc721TokenWithdraws
  );
  const value = useMemo(
    () => ({
      treasuryModuleContract,
      treasuryAssetsFungible,
      treasuryAssetsNonFungible,
    }),
    [treasuryModuleContract, treasuryAssetsFungible, treasuryAssetsNonFungible]
  );
  return <TreasuryContext.Provider value={value}>{children}</TreasuryContext.Provider>;
}
