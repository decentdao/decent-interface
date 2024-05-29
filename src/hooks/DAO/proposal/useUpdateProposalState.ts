import { useCallback, Dispatch } from 'react';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../../assets/abi/Azorius';
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
  governanceContracts: { azoriusContractAddress },
  governanceDispatch,
}: IUseUpdateProposalState) {
  const publicClient = usePublicClient();
  const updateProposalState = useCallback(
    async (proposalId: number) => {
      if (!azoriusContractAddress || !publicClient) {
        return;
      }
      const azoriusContract = getContract({
        abi: AzoriusAbi,
        address: getAddress(azoriusContractAddress),
        client: publicClient,
      });

      const newState = await getAzoriusProposalState(azoriusContract, proposalId);
      governanceDispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalId: proposalId.toString(), state: newState },
      });
    },
    [azoriusContractAddress, governanceDispatch, publicClient],
  );

  return updateProposalState;
}
