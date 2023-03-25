import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzuriousProposals } from './governance/useAzuriousProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useDAOProposals = () => {
  const {
    node: { daoAddress },
    governanceContracts,
    dispatch,
  } = useFractal();

  const loadAzuriousProposals = useAzuriousProposals();
  const loadSafeMultisigProposals = useSafeMultisigProposals();
  const { setMethodOnInterval } = useUpdateTimer(daoAddress || undefined);
  const loadDAOProposals = useCallback(async () => {
    const { usulContract } = governanceContracts;

    if (!!usulContract) {
      // load Usul proposals and strategies
      dispatch.governance({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: await loadAzuriousProposals(),
      });
    } else {
      // load mulisig proposals
      setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    governanceContracts,
    loadAzuriousProposals,
    dispatch,
    loadSafeMultisigProposals,
    setMethodOnInterval,
  ]);

  return loadDAOProposals;
};
