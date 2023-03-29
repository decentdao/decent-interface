import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { useAzoriusProposals } from './governance/useAzoriusProposals';

export const useDAOProposals = () => {
  const { governanceContracts, dispatch } = useFractal();

  const loadAzoriusProposals = useAzoriusProposals();

  const loadDAOProposals = useCallback(async () => {
    const { usulContract } = governanceContracts;

    if (!!usulContract) {
      // load Usul proposals and strategies
      dispatch.governance({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: await loadAzoriusProposals(),
      });
    } else {
      // load mulisig proposals
    }
  }, [governanceContracts, loadAzoriusProposals, dispatch]);
  return loadDAOProposals;
};
