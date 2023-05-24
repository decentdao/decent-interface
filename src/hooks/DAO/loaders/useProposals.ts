import { useCallback } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { GovernanceModuleType } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useDAOProposals = () => {
  const {
    node: { daoAddress },
    governanceContracts,
    action,
  } = useFractal();

  const loadAzoriusProposals = useAzoriusProposals();
  const loadSafeMultisigProposals = useSafeMultisigProposals();
  const { setMethodOnInterval } = useUpdateTimer(daoAddress);
  const loadDAOProposals = useCallback(async () => {
    const { azoriusContract } = governanceContracts;

    if (!!azoriusContract) {
      // load Azorius proposals and strategies
      try {
        action.dispatch({
          type: FractalGovernanceAction.SET_PROPOSALS,
          payload: {
            type: GovernanceModuleType.AZORIUS,
            proposals: await loadAzoriusProposals(),
          },
        });
      } catch (e) {
        logError(e);
      }
    } else {
      // load mulisig proposals
      setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    governanceContracts,
    loadAzoriusProposals,
    action,
    loadSafeMultisigProposals,
    setMethodOnInterval,
  ]);

  return loadDAOProposals;
};
