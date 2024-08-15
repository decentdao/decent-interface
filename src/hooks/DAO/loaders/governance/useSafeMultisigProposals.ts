import { useCallback } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useSafeAPI } from '../../../../providers/App/hooks/useSafeAPI';
import { ActivityEventType, MultisigProposal } from '../../../../types';
import { useSafeTransactions } from '../../../utils/useSafeTransactions';

export const useSafeMultisigProposals = () => {
  const {
    node: { safe },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();

  const { parseTransactions } = useSafeTransactions();

  const loadSafeMultisigProposals = useCallback(async () => {
    if (!safe?.address || !safeAPI) {
      return;
    }
    try {
      const transactions = await safeAPI.getAllTransactions(safe.address);
      const activities = await parseTransactions(transactions, safe.address);
      const multisendProposals = activities.filter(
        activity => activity.eventType !== ActivityEventType.Treasury,
      ) as MultisigProposal[];

      action.dispatch({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: multisendProposals,
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
  }, [safe, safeAPI, parseTransactions, action]);

  return { loadSafeMultisigProposals };
};
