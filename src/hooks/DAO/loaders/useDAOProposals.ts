import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { useAzuriousProposals } from './governance/useAzuriousProposals';

export const useDAOProposals = () => {
  const { governanceContracts, dispatch } = useFractal();

  const loadAzuriousProposals = useAzuriousProposals();

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
    }
  }, [governanceContracts, loadAzuriousProposals, dispatch]);
  return loadDAOProposals;
};
