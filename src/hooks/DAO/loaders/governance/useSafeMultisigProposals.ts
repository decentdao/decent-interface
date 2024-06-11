import { useCallback } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useSafeAPI } from '../../../../providers/App/hooks/useSafeAPI';
import {
  ActivityEventType,
  FractalProposal,
  FractalProposalState,
  MultisigProposal,
} from '../../../../types';
import { useSafeTransactions } from '../../../utils/useSafeTransactions';

export const useSafeMultisigProposals = () => {
  const {
    node: { daoAddress },
    governance: { proposals },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();

  const { parseTransactions } = useSafeTransactions();

  const loadSafeMultisigProposals = useCallback(async () => {
    if (!daoAddress || !safeAPI) {
      return;
    }
    try {
      const alreadyLoadedExecutedProposals = (proposals || []).filter(
        proposal => proposal.state === FractalProposalState.EXECUTED,
      );

      console.log("alreadyLoadedExecutedProposals: ", alreadyLoadedExecutedProposals);
      

      const transactions = await safeAPI.getAllTransactions(daoAddress);
      const activities = await parseTransactions(transactions, daoAddress);
      const multisendProposals = activities.filter(
        activity => activity.eventType !== ActivityEventType.Treasury,
      ) as MultisigProposal[];

      // action.dispatch({
      //   type: FractalGovernanceAction.SET_PROPOSALS,
      //   payload: multisendProposals,
      // });

      action.dispatch({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: [
          ...alreadyLoadedExecutedProposals,
          ...multisendProposals.filter(
            proposal =>
              !alreadyLoadedExecutedProposals.find(p => p.proposalId === proposal.proposalId),
          ),
        ],
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
  }, [daoAddress, safeAPI, proposals, parseTransactions, action]);

  const refreshSafeMultisigProposal = useCallback(
    async (proposal: FractalProposal) => {
      console.log('\n\nrefreshSafeMultisigProposal');
      console.log('proposals before: ', proposals);
      console.log('\n\n');

      if (!proposals) return;

      action.dispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalId: proposal.proposalId, state: FractalProposalState.EXECUTED },
      });

      // action.dispatch({
      //   type: FractalGovernanceAction.SET_PROPOSALS,
      //   payload: [
      //     ...proposals.filter(p => p.proposalId !== proposal.proposalId),
      //     { ...proposal, state: FractalProposalState.EXECUTED },
      //   ],
      // });
    },
    [action, proposals],
  );

  return { loadSafeMultisigProposals, refreshSafeMultisigProposal };
};
