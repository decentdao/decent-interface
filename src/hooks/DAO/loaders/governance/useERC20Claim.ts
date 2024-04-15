import { useEffect, useCallback, useRef } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ERC20Claim } from '../../../../types';
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
  const publicClient = usePublicClient();
  const baseContracts = useSafeContracts();
  const loadTokenClaimContract = useCallback(async () => {
    if (!baseContracts || !votesTokenContractAddress || !publicClient) {
      return;
    }
    const { claimingMasterCopyContract } = baseContracts;

    const votesTokenContract = getContract({
      address: votesTokenContractAddress,
      abi: baseContracts.votesTokenMasterCopyContract.asPublic.abi,
      client: publicClient,
    });

    const approvals = await votesTokenContract.getEvents.Approval();
    if (!approvals.length) {
      return;
    }
    const possibleTokenClaimContract = getContract({
      abi: claimingMasterCopyContract.asPublic.abi,
      client: publicClient,
      address: approvals[0].topics[1]!,
    });
    const tokenClaimArray = await possibleTokenClaimContract.getEvents
      .ERC20ClaimCreated()
      .catch(() => []);

    if (!tokenClaimArray.length || tokenClaimArray[0].topics[1] === votesTokenContractAddress) {
      return;
    }
    // action to governance
    action.dispatch({
      type: FractalGovernanceAction.SET_CLAIMING_CONTRACT,
      payload: possibleTokenClaimContract as unknown as ERC20Claim,
    });
  }, [baseContracts, votesTokenContractAddress, action, publicClient]);
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
