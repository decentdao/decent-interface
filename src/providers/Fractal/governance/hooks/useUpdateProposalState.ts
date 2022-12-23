import { BigNumber } from 'ethers';
import { useCallback, Dispatch } from 'react';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { getTxProposalState } from '../../utils';
import { GovernanceAction, GovernanceActions } from '../actions';
import { UsulProposal, IGovernance } from '../types';

interface IUseUpdateProposalState {
  governance: IGovernance;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export default function useUpdateProposalState({
  governance: {
    txProposalsInfo,
    contracts: { usulContract },
  },
  governanceDispatch,
}: IUseUpdateProposalState) {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const updateProposalState = useCallback(
    async (proposalNumber: BigNumber) => {
      if (!usulContract || !signerOrProvider) {
        return;
      }
      const proposals = await Promise.all(
        (txProposalsInfo.txProposals as UsulProposal[]).map(async proposal => {
          if (proposalNumber.eq(proposal.proposalNumber)) {
            const updatedProposal = {
              ...proposal,
              state: await getTxProposalState(usulContract, proposalNumber, signerOrProvider),
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
    [signerOrProvider, usulContract, governanceDispatch, txProposalsInfo]
  );

  return updateProposalState;
}
