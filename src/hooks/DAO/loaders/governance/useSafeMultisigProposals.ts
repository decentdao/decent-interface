import { useCallback } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useSafeAPI } from '../../../../providers/App/hooks/useSafeAPI';
import { useSafeTransactions } from '../../../utils/useSafeTransactions';

export const useSafeMultisigProposals = () => {
  const {
    node: { daoAddress },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();

  const { parseTransactions } = useSafeTransactions();

  const loadSafeMultisigProposals = useCallback(async () => {
    if (!daoAddress || !safeAPI) {
      return;
    }
    try {
      const multisigTransactions = await safeAPI.getMultisigTransactions(daoAddress);
      const activities = await parseTransactions(multisigTransactions);

      action.dispatch({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: activities,
      });

      action.dispatch({
        type: FractalGovernanceAction.SET_LOADING_PROPOSALS,
        payload: false,
      });
      action.dispatch({
        type: FractalGovernanceAction.SET_ALL_PROPOSALS_LOADED,
        payload: true,
      });
    } catch (e) {
      logError(e);
    }
  }, [daoAddress, safeAPI, parseTransactions, action]);

  return { loadSafeMultisigProposals };
};
