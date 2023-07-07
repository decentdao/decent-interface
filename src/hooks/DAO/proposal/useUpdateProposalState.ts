import { BigNumber } from 'ethers';
import { useCallback, Dispatch } from 'react';
import {
  FractalGovernanceAction,
  FractalGovernanceActions,
} from '../../../providers/App/governance/action';
import { FractalGovernanceContracts } from '../../../types';
import { getAzoriusProposalState } from '../../../utils';

interface IUseUpdateProposalState {
  governanceContracts: FractalGovernanceContracts;
  governanceDispatch: Dispatch<FractalGovernanceActions>;
}

export default function useUpdateProposalState({
  governanceContracts: { azoriusContract, ozLinearVotingContract },
  governanceDispatch,
}: IUseUpdateProposalState) {
  const updateProposalState = useCallback(
    async (proposalId: BigNumber) => {
      if (!azoriusContract || !ozLinearVotingContract) {
        return;
      }
      const newState = await getAzoriusProposalState(azoriusContract.asSigner, proposalId);
      governanceDispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalId: proposalId.toString(), state: newState },
      });
    },
    [azoriusContract, ozLinearVotingContract, governanceDispatch]
  );

  return updateProposalState;
}
