import { useCallback } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ActivityEventType, MultisigProposal } from '../../../../types';
import { useSafeTransactions } from '../../../utils/useSafeTransactions';
import { StrategyType } from './../../../../types/fractal';
export const useSafeMultisigProposals = () => {
  const {
    node: { daoAddress },
    clients: { safeService },
    dispatch,
  } = useFractal();

  const { parseTransactions } = useSafeTransactions();

  const loadSafeMultisigProposals = useCallback(async () => {
    if (!daoAddress || !safeService) {
      return;
    }
    try {
      const transactions = await safeService.getAllTransactions(daoAddress);
      const activities = parseTransactions(transactions, daoAddress);
      const multisendProposals = activities.filter(
        activity => activity.eventType !== ActivityEventType.Treasury
      );
      dispatch.governance({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: {
          type: StrategyType.GNOSIS_SAFE,
          proposals: multisendProposals as MultisigProposal[],
        },
      });
    } catch (e) {
      logError(e);
    }
  }, [daoAddress, safeService, parseTransactions, dispatch]);
  return loadSafeMultisigProposals;
};
