import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { AzoriusProposal, GovernanceType, ProposalVotesSummary } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useDAOProposals = () => {
  const {
    node: { daoAddress },
    governance: { type },
    action,
  } = useFractal();

  const proposalCreatedEventCallback = useCallback(
    (proposal: AzoriusProposal) => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
        payload: proposal,
      });
    },
    [action],
  );

  const erc20VotedEventCallback = useCallback(
    (
      proposalId: number,
      voter: string,
      support: number,
      weight: BigNumber,
      votesSummary: ProposalVotesSummary,
    ) => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE,
        payload: {
          proposalId: proposalId.toString(),
          voter,
          support,
          weight,
          votesSummary,
        },
      });
    },
    [action],
  );

  const erc721VotedEventCallback = useCallback(
    (
      proposalId: number,
      voter: string,
      voteType: number,
      tokenAddresses: string[],
      tokenIds: BigNumber[],
      votesSummary: ProposalVotesSummary,
    ) => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE,
        payload: {
          proposalId: proposalId.toString(),
          voter,
          support: voteType,
          tokenAddresses,
          tokenIds: tokenIds.map(tokenId => tokenId.toString()),
          votesSummary,
        },
      });
    },
    [action],
  );

  const { setMethodOnInterval, clearIntervals } = useUpdateTimer(daoAddress);
  const azoriusProposals = useAzoriusProposals(
    proposalCreatedEventCallback,
    erc20VotedEventCallback,
    erc721VotedEventCallback,
  );
  const loadSafeMultisigProposals = useSafeMultisigProposals();

  const loadDAOProposals = useCallback(async () => {
    clearIntervals();
    if (
      (type === GovernanceType.AZORIUS_ERC20 || type === GovernanceType.AZORIUS_ERC721) &&
      azoriusProposals !== undefined
    ) {
      // load Azorius proposals and strategies
      azoriusProposals.loadAzoriusProposals(proposal => {
        action.dispatch({
          type: FractalGovernanceAction.SET_AZORIUS_PROPOSAL,
          payload: proposal,
        });
      });
    } else if (type === GovernanceType.MULTISIG) {
      // load mulisig proposals
      setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    clearIntervals,
    type,
    azoriusProposals,
    action,
    setMethodOnInterval,
    loadSafeMultisigProposals,
  ]);

  return loadDAOProposals;
};
