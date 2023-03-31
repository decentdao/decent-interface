import { BigNumber } from 'ethers';
import { useCallback, Dispatch } from 'react';
import { FractalGovernanceContracts } from '../../../../types';
import { getTxProposalState } from '../../../../utils';
import { FractalGovernanceAction, FractalGovernanceActions } from '../../../App/governance/action';

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
