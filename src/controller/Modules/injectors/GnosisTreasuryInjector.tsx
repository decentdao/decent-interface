import { cloneElement } from 'react';
import useGnosisEvents from '../../../providers/gnosis/hooks/useGnosisEvents';
import { useGnosisWrapper } from '../../../providers/gnosis/hooks/useGnosisWrapper';

export function GnosisTreasuryInjector({ children }: { children: JSX.Element }) {
  const { state } = useGnosisWrapper();
  const { transactions } = useGnosisEvents(state.safeAddress);

  return cloneElement(children, {
    transactions,
  });
}
