import { VotesToken } from '@fractal-framework/fractal-contracts';
import { useEffect, useCallback, Dispatch } from 'react';
// get list of approvals; approval [0] should be token claim
// query using attach = masterTokenClaim.attach(approval[0]).queryFilter()
// check if module is tokenClaim;
// set token claim;

import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { ContractConnection, GovernanceAction, GovernanceActions } from '../../../types';

interface IUseTokenClaim {
  tokenContract?: ContractConnection<VotesToken>;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export function useTokenClaim({ tokenContract, governanceDispatch }: IUseTokenClaim) {
  const { claimingMasterCopyContract } = useSafeContracts();

  const loadTokenClaimContract = useCallback(async () => {
    if (!claimingMasterCopyContract || !tokenContract) return;

    const approvalFilter = tokenContract.asSigner.filters.Approval();
    const approvals = await tokenContract.asSigner.queryFilter(approvalFilter);
    if (!approvals.length) return;
    const possibleTokenClaimContract = claimingMasterCopyContract.asSigner.attach(
      approvals[0].args[1]
    );
    const tokenClaimFilter = possibleTokenClaimContract.filters.TokenClaimCreated();
    const tokenClaimArray = await possibleTokenClaimContract
      .queryFilter(tokenClaimFilter)
      .catch(() => []);
    if (!tokenClaimArray.length && tokenClaimArray[0].args[1] === tokenContract.asSigner.address) {
      return;
    }
    // dispatch to governance
    governanceDispatch({
      type: GovernanceAction.SET_CLAIMING_CONTRACT,
      payload: possibleTokenClaimContract,
    });
  }, [claimingMasterCopyContract, tokenContract, governanceDispatch]);

  useEffect(() => {
    loadTokenClaimContract();
  }, [loadTokenClaimContract]);
  return;
}
