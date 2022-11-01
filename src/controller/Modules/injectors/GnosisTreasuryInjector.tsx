import { PropsWithChildren } from 'react';
import { useGnosis } from '../../../providers/gnosis/hooks/useGnosis';
import useGnosisEvents from '../../../providers/gnosis/hooks/useGnosisEvents';
import { GnosisTreasuryInjectorContext } from './GnosisTreasuryInjectorContext';

export function GnosisTreasuryInjector({ children }: PropsWithChildren) {
  const { state } = useGnosis();
  const { depositEvents, withdrawEvents } = useGnosisEvents(state.safeAddress);

  const value = {
    transactions: [...depositEvents, ...withdrawEvents],
    gnosisAssetsFungible: [...state.treasuryAssetsFungible],
    gnosisAssetsNonFungible: [...state.treasuryAssetsNonFungible],
  };

  return (
    <GnosisTreasuryInjectorContext.Provider value={value}>
      {children}
    </GnosisTreasuryInjectorContext.Provider>
  );
}
