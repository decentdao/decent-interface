import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { GovernanceType } from '../../../types';
import { CacheKeys } from '../../utils/cache/cacheDefaults';
import { useLocalStorage } from '../../utils/cache/useLocalStorage';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { TempProposalData } from '../proposal/useSubmitProposal';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useLoadDAOProposals = () => {
  const {
    node: { daoAddress },
    governance: { type },
    action,
  } = useFractal();

  const { setMethodOnInterval, clearIntervals } = useUpdateTimer(daoAddress);
  const loadAzoriusProposals = useAzoriusProposals();
  const { loadSafeMultisigProposals } = useSafeMultisigProposals();

  const loadDAOProposals = useCallback(async () => {
    clearIntervals();
    if (type === GovernanceType.AZORIUS_ERC20 || type === GovernanceType.AZORIUS_ERC721) {
      // load Azorius proposals and strategies
      return loadAzoriusProposals(proposal => {
        action.dispatch({
          type: FractalGovernanceAction.SET_AZORIUS_PROPOSAL,
          payload: proposal,
        });
      });
    } else if (type === GovernanceType.MULTISIG) {
      // load mulisig proposals
      // @dev what is the point of setMethodOnInterval here?
      return setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    clearIntervals,
    type,
    loadAzoriusProposals,
    action,
    setMethodOnInterval,
    loadSafeMultisigProposals,
  ]);

  return loadDAOProposals;
};

export const useLoadTempProposals = () => {
  const { getValue } = useLocalStorage();

  const loadTempDAOProposals = useCallback(async () => {
    return (getValue(CacheKeys.TEMP_PROPOSALS) || []) as TempProposalData[];
  }, [getValue]);

  return loadTempDAOProposals;
};
