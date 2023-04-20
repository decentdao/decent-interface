import { BigNumber } from 'ethers';
import { useCallback, Dispatch } from 'react';
import {
  FractalGovernanceAction,
  FractalGovernanceActions,
} from '../../../providers/App/governance/action';
import { FractalGovernanceContracts } from '../../../types';
import { getFractalProposalState } from '../../../utils';

interface IUseUpdateProposalState {
  governanceContracts: FractalGovernanceContracts;
  governanceDispatch: Dispatch<FractalGovernanceActions>;
  chainId: number;
}

export default function useUpdateProposalState({
  governanceContracts: { azoriusContract, ozLinearVotingContract },
  governanceDispatch,
  chainId,
}: IUseUpdateProposalState) {
  const updateProposalState = useCallback(
    async (proposalNumber: BigNumber) => {
      if (!azoriusContract || !ozLinearVotingContract) {
        return;
      }
      const newState = await getFractalProposalState(
        ozLinearVotingContract.asSigner,
        azoriusContract.asSigner,
        proposalNumber,
        chainId
      );
      governanceDispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalNumber: proposalNumber.toString(), state: newState },
      });
    },
    [azoriusContract, ozLinearVotingContract, governanceDispatch, chainId]
  );

  return updateProposalState;
}
