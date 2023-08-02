import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { GovernanceType } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useDAOProposals = () => {
  const {
    node: { daoAddress },
    governance: { type },
    action,
  } = useFractal();

  const loadAzoriusProposals = useAzoriusProposals();
  const loadSafeMultisigProposals = useSafeMultisigProposals();
  const { setMethodOnInterval, removeMethodInterval } = useUpdateTimer(daoAddress);
  const loadDAOProposals = useCallback(async () => {
    if (type === GovernanceType.AZORIUS_ERC20 || type === GovernanceType.AZORIUS_ERC721) {
      // load Azorius proposals and strategies
      removeMethodInterval(loadSafeMultisigProposals);
      action.dispatch({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: await loadAzoriusProposals(),
      });
    } else if (type === GovernanceType.MULTISIG) {
      // load mulisig proposals
      setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    type,
    loadAzoriusProposals,
    action,
    loadSafeMultisigProposals,
    setMethodOnInterval,
    removeMethodInterval,
  ]);

  return loadDAOProposals;
};
