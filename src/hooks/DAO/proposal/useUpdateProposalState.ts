import { useCallback, Dispatch } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
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
  const publicClient = usePublicClient();
  const updateProposalState = useCallback(
    async (proposalId: bigint) => {
      if (!azoriusContractAddress || !baseContracts || !publicClient) {
        return;
      }
      const azoriusContract = getContract({
        address: azoriusContractAddress,
        client: publicClient,
        abi: baseContracts.fractalAzoriusMasterCopyContract.asPublic.abi,
      });
      const newState = await getAzoriusProposalState(azoriusContract, proposalId);
      governanceDispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { proposalId: proposalId.toString(), state: newState },
      });
    },
    [azoriusContractAddress, governanceDispatch, baseContracts, publicClient],
  );

  return updateProposalState;
}
