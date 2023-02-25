import { BigNumber } from 'ethers';
import { useCallback, Dispatch } from 'react';
import { getTxProposalState } from '../../utils';
import { GovernanceAction, GovernanceActions } from '../actions';
import { UsulProposal, IGovernance } from '../types';

interface IUseUpdateProposalState {
  governance: IGovernance;
  governanceDispatch: Dispatch<GovernanceActions>;
  chainId: number;
}

export default function useUpdateProposalState({
  governance: {
    txProposalsInfo,
    contracts: { usulContract, ozLinearVotingContract },
  },
  governanceDispatch,
  chainId,
}: IUseUpdateProposalState) {
  const updateProposalState = useCallback(
    async (proposalNumber: BigNumber) => {
      if (!usulContract || !ozLinearVotingContract) {
        return;
      }
      const proposals = await Promise.all(
        (txProposalsInfo.txProposals as UsulProposal[]).map(async proposal => {
          if (proposalNumber.eq(proposal.proposalNumber)) {
            const updatedProposal = {
              ...proposal,
              state: await getTxProposalState(
                usulContract,
                ozLinearVotingContract,
                proposalNumber,
                chainId
              ),
            };
            return updatedProposal;
          }
          return proposal;
        })
      );

      governanceDispatch({
        type: GovernanceAction.UPDATE_PROPOSALS,
        payload: {
          txProposals: proposals,
          passed: txProposalsInfo.passed,
          active: txProposalsInfo.active ? txProposalsInfo.active : 1,
        },
      });
    },
    [
      usulContract,
      ozLinearVotingContract,
      txProposalsInfo.txProposals,
      txProposalsInfo.passed,
      txProposalsInfo.active,
      governanceDispatch,
      chainId,
    ]
  );

  return updateProposalState;
}
