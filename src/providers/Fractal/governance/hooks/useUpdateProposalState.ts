import { BigNumber } from 'ethers';
import { useCallback, Dispatch } from 'react';
import { FractalGovernanceContracts } from '../../../../types';
import { FractalGovernanceAction, FractalGovernanceActions } from '../../../App/governance/action';
import { getTxProposalState } from '../../utils';

interface IUseUpdateProposalState {
  governanceContracts: FractalGovernanceContracts;
  governanceDispatch: Dispatch<FractalGovernanceActions>;
  chainId: number;
}

export default function useUpdateProposalState({
  governanceContracts: { usulContract, ozLinearVotingContract },
  governanceDispatch,
  chainId,
}: IUseUpdateProposalState) {
  const updateProposalState = useCallback(
    async (proposalNumber: BigNumber) => {
      if (!usulContract || !ozLinearVotingContract) {
        return;
      }
      const newState = await getTxProposalState(
        ozLinearVotingContract.asSigner,
        usulContract.asSigner,
        proposalNumber,
        chainId
      );

      governanceDispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalNumber: proposalNumber.toString(), state: newState },
      });
    },
    [usulContract, ozLinearVotingContract, governanceDispatch, chainId]
  );

  return updateProposalState;
}
