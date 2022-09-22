import { PropsWithChildren } from 'react';
import { useTreasuryModule } from '../../../providers/treasury/hooks/useTreasuryModule';
import useTreasuryEvents from '../../../providers/treasury/hooks/useTreasuryEvents';
import { TreasuryInjectorContext } from './TreasuryInjectorContext';

export function TreasuryInjector({ children }: PropsWithChildren) {
  const { treasuryModuleContract, treasuryAssetsFungible, treasuryAssetsNonFungible } =
    useTreasuryModule();
  const {
    nativeDeposits,
    nativeWithdraws,
    erc20TokenDeposits,
    erc20TokenWithdraws,
    erc721TokenDeposits,
    erc721TokenWithdraws,
  } = useTreasuryEvents(treasuryModuleContract);

  const value = {
    transactions: [
      ...(nativeDeposits || []),
      ...nativeWithdraws,
      ...erc20TokenDeposits,
      ...erc20TokenWithdraws,
      ...erc721TokenDeposits,
      ...erc721TokenWithdraws,
    ],
    treasuryAssetsFungible,
    treasuryAssetsNonFungible,
  };

  return (
    <TreasuryInjectorContext.Provider value={value}>{children}</TreasuryInjectorContext.Provider>
  );
}
