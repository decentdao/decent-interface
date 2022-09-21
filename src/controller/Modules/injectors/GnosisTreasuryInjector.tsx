import { cloneElement } from 'react';
import useGnosisEvents from '../../../providers/gnosis/hooks/useGnosisEvents';
import { useGnosisWrapper } from '../../../providers/gnosis/hooks/useGnosisWrapper';
import useGnosisWrapperContract from '../../../providers/gnosis/hooks/useGnosisWrapperContract';

export function GnosisTreasuryInjector({ children }: { children: JSX.Element }) {
  const { state } = useGnosisWrapper();
  const gnosisWrapperContract = useGnosisWrapperContract(state.safeAddress!);
  const { events } = useGnosisEvents(gnosisWrapperContract);

  // TODO: Pass events in more modular way
  return cloneElement(children, {
    transactions: events,
  });
}
