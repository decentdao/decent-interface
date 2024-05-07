import { useEffect, useCallback, useRef } from 'react';
import { getContract, getAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import VotesERC20Abi from '../../../../assets/abi/VotesERC20';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import useSafeContracts from '../../../safe/useSafeContracts';
// get list of approvals; approval [0] should be token claim
// query using attach = masterTokenClaim.attach(approval[0]).queryFilter()
// check if module is tokenClaim;
// set token claim;

export function useERC20Claim() {
  const {
    node: { daoAddress },
    governanceContracts: { votesTokenContractAddress },
    action,
  } = useFractal();
  const baseContracts = useSafeContracts();
  const publicClient = usePublicClient();

  const loadTokenClaimContract = useCallback(async () => {
    if (!baseContracts || !votesTokenContractAddress || !publicClient) {
      return;
    }
    const { claimingMasterCopyContract } = baseContracts;

    const votesTokenContract = getContract({
      abi: VotesERC20Abi,
      address: getAddress(votesTokenContractAddress),
      client: publicClient,
    });

    // TODO here be dark programming...

    const approvals = await votesTokenContract.getEvents.Approval();

    if (approvals.length === 0 || !approvals[0].args.spender) {
      return;
    }

    const possibleTokenClaimContract = claimingMasterCopyContract.asProvider.attach(
      getAddress(approvals[0].args.spender),
    );
    const tokenClaimFilter = possibleTokenClaimContract.filters.ERC20ClaimCreated();
    const tokenClaimArray = await possibleTokenClaimContract
      .queryFilter(tokenClaimFilter)
      .catch(() => []);

    if (!tokenClaimArray.length || tokenClaimArray[0].args[1] === votesTokenContractAddress) {
      return;
    }
    // action to governance
    action.dispatch({
      type: FractalGovernanceAction.SET_CLAIMING_CONTRACT,
      payload: possibleTokenClaimContract,
    });
  }, [action, baseContracts, publicClient, votesTokenContractAddress]);

  const loadKey = useRef<string>();

  useEffect(() => {
    if (
      daoAddress &&
      votesTokenContractAddress &&
      daoAddress + votesTokenContractAddress !== loadKey.current
    ) {
      loadKey.current = daoAddress + votesTokenContractAddress;
      loadTokenClaimContract();
    }
    if (!daoAddress || !votesTokenContractAddress) {
      loadKey.current = undefined;
    }
  }, [loadTokenClaimContract, daoAddress, votesTokenContractAddress]);
  return;
}
