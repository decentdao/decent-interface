import { BigNumber } from 'ethers';
import { useCallback, Dispatch } from 'react';
import {
  FractalGovernanceAction,
  FractalGovernanceActions,
} from '../../../providers/App/governance/action';
import { FractalGovernanceContracts } from '../../../types';
import { getAzoriusProposalState } from '../../../utils';
import useSafeContracts from '../../safe/useSafeContracts';

interface IUseUpdateProposalState {
  governanceContracts: FractalGovernanceContracts;
  governanceDispatch: Dispatch<FractalGovernanceActions>;
}

export default function useUpdateProposalState({
  governanceContracts: { azoriusContractAddress },
  governanceDispatch,
}: IUseUpdateProposalState) {
  const baseContracts = useSafeContracts();
  const updateProposalState = useCallback(
    async (proposalId: BigNumber) => {
      if (!azoriusContractAddress || !baseContracts) {
        return;
      }
      const azoriusContract = baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(
        azoriusContractAddress,
      );
      const newState = await getAzoriusProposalState(azoriusContract, proposalId);
      governanceDispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalId: proposalId.toString(), state: newState },
      });
    },
    [azoriusContractAddress, governanceDispatch, baseContracts],
  );

  return updateProposalState;
}
