import { useEffect, useCallback } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
// get list of approvals; approval [0] should be token claim
// query using attach = masterTokenClaim.attach(approval[0]).queryFilter()
// check if module is tokenClaim;
// set token claim;

export function useERC20Claim() {
  const {
    governanceContracts: { tokenContract },
    baseContracts: { claimingMasterCopyContract },
    action,
  } = useFractal();

  const loadTokenClaimContract = useCallback(async () => {
    if (!claimingMasterCopyContract || !tokenContract) return;

    const approvalFilter = tokenContract.asProvider.filters.Approval();
    const approvals = await tokenContract.asProvider.queryFilter(approvalFilter);
    if (!approvals.length) return;
    const possibleTokenClaimContract = claimingMasterCopyContract.asProvider.attach(
      approvals[0].args[1]
    );
    const tokenClaimFilter = possibleTokenClaimContract.filters.ERC20ClaimCreated();
    const tokenClaimArray = await possibleTokenClaimContract
      .queryFilter(tokenClaimFilter)
      .catch(() => []);

    if (
      !tokenClaimArray.length ||
      tokenClaimArray[0].args[1] === tokenContract.asProvider.address
    ) {
      return;
    }
    // action to governance
    action.dispatch({
      type: FractalGovernanceAction.SET_CLAIMING_CONTRACT,
      payload: possibleTokenClaimContract,
    });
  }, [claimingMasterCopyContract, tokenContract, action]);

  useEffect(() => {
    loadTokenClaimContract();
  }, [loadTokenClaimContract]);
  return;
}
