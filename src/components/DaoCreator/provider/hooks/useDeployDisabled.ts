import { useState, useEffect } from 'react';
import { CreatorState, GovernanceTypes } from './../types';

// This hook will track form progress and ensure data is validated before allowing submission
export function useDeployDisabled(state: CreatorState) {
  const [isDeployDisabled, setDeployDisabled] = useState(true);

  useEffect(() => {
    switch (state.governance) {
      case GovernanceTypes.TOKEN_VOTING_GOVERNANCE: {
        const { govModule, govToken, essentials } = state;

        const isEssentialsComplete = !!essentials.daoName.trim();
        const isGovTokenComplete =
          !!govToken.tokenName.trim() &&
          !!govToken.tokenSymbol.trim() &&
          Number(govToken.tokenSupply) > 0 &&
          govToken.tokenAllocations
            .map(tokenAllocation => Number(tokenAllocation.amount))
            .reduce((prev, curr) => prev + curr, 0) <= Number(govToken.tokenSupply);
        const isGovModuleComplete =
          Number(govModule.proposalThreshold) >= 0 &&
          Number(govModule.quorum) >= 0 &&
          Number(govModule.quorum) <= 100 &&
          Number(govModule.executionDelay) >= 0 &&
          Number(govModule.lateQuorumExecution) >= 0 &&
          Number(govModule.voteStartDelay) >= 0 &&
          Number(govModule.votingPeriod) > 0 &&
          govModule.proposalThreshold.trim() !== '' &&
          govModule.quorum.trim() !== '' &&
          govModule.executionDelay.trim() !== '' &&
          govModule.lateQuorumExecution.trim() !== '' &&
          govModule.voteStartDelay.trim() !== '' &&
          govModule.votingPeriod.trim() !== '';
        setDeployDisabled(isEssentialsComplete && isGovModuleComplete && isGovTokenComplete);
        break;
      }
      case GovernanceTypes.GNOSIS_SAFE: {
        const {
          gnosis: { trustedAddresses, signatureThreshold },
        } = state;

        const isTrustedAddressValid =
          !trustedAddresses.some(trustee => trustee.error) && trustedAddresses[0].address !== '';

        const isSignatureThresholdValid =
          Number(signatureThreshold) > 0 && Number(signatureThreshold) <= trustedAddresses.length;

        setDeployDisabled(!isTrustedAddressValid && !isSignatureThresholdValid);
        break;
      }
    }
  }, [state]);
  return isDeployDisabled;
}
