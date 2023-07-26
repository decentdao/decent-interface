import { useCallback } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { GovernanceSelectionType } from '../../../types';
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
    const { azoriusContract, ozLinearVotingContract, erc721LinearVotingContract } =
      governanceContracts;

    if (!!azoriusContract) {
      // load Azorius proposals and strategies
      let type = ozLinearVotingContract
        ? GovernanceSelectionType.AZORIUS_ERC20
        : erc721LinearVotingContract
        ? GovernanceSelectionType.AZORIUS_ERC721
        : undefined;

      if (type) {
        try {
          action.dispatch({
            type: FractalGovernanceAction.SET_PROPOSALS,
            payload: {
              type,
              proposals: await loadAzoriusProposals(),
            },
          });
        } catch (e) {
          logError(e);
        }
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
