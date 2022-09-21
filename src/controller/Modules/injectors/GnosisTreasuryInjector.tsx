import { PropsWithChildren } from 'react';
import useGnosisEvents from '../../../providers/gnosis/hooks/useGnosisEvents';
import { useGnosisWrapper } from '../../../providers/gnosis/hooks/useGnosisWrapper';
import { TreasuryInjectorContext } from './TreasuryInjectorContext';

export function GnosisTreasuryInjector({ children }: PropsWithChildren) {
  const { state } = useGnosisWrapper();
  const { depositEvents, withdrawEvents } = useGnosisEvents(state.safeAddress);

  const value = {
    transactions: [...depositEvents, ...withdrawEvents],
  };

  return (
    <TreasuryInjectorContext.Provider value={value}>{children}</TreasuryInjectorContext.Provider>
  );
}
