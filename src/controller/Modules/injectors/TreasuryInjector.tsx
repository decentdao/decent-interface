import { cloneElement } from 'react';
import { useTreasuryModule } from '../../../providers/treasury/hooks/useTreasuryModule';
import useTreasuryEvents from '../../../providers/treasury/hooks/useTreasuryEvents';

// TODO: At least it makes sense to refactor TreasuryInjector and GovernanceInjector to HOCs
// That will look way more "React.js-way", as current Injector pattern looks more like from Angular :D
// However, need discussion for this during PR review
export function TreasuryInjector({ children }: { children: JSX.Element }) {
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

  return cloneElement(children, {
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
  });
}
