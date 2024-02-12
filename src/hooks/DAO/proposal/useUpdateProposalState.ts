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
  governanceContracts: { azoriusContract },
  governanceDispatch,
}: IUseUpdateProposalState) {
  const updateProposalState = useCallback(
    async (proposalId: BigNumber) => {
      if (!azoriusContract) {
        return;
      }
      const newState = await getAzoriusProposalState(azoriusContract.asProvider, proposalId);
      governanceDispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalId: proposalId.toString(), state: newState },
      });
    },
    [azoriusContract, governanceDispatch]
  );

  return updateProposalState;
}
