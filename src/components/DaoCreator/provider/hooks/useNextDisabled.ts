import { useState, useEffect } from 'react';
import { BigNumber } from 'ethers';
import { CreatorState, CreatorSteps } from './../types';

/**
 * This hook updates the next page button's disable state for each form
 * @param state
 * @returns
 */
export function useNextDisabled(state: CreatorState) {
  const [isNextDisbled, setIsDisabled] = useState(true);

  useEffect(() => {
    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
        if (!!state.essentials.daoName.trim()) {
          setIsDisabled(false);
          break;
        }
        setIsDisabled(true);
        break;
      case CreatorSteps.FUNDING:
        setIsDisabled(false);
        break;
      case CreatorSteps.TREASURY_GOV_TOKEN:
        if (state.govToken) {
          if (!state.govToken.tokenAllocations || !state.govToken.tokenSupply) {
            setIsDisabled(true);
            break;
          }
          const isAllocationsValid = state.govToken.tokenAllocations
            .map(tokenAllocation => tokenAllocation.amount)
            .reduce((prev, curr) => prev.add(curr), BigNumber.from(0))
            .add(state.govToken.parentAllocationAmount || 0)
            .lte(state.govToken.tokenSupply);

          setIsDisabled(!isAllocationsValid);
          break;
        }
        setIsDisabled(true);
        break;
      case CreatorSteps.GOV_CONFIG:
        setIsDisabled(false);
        break;
      case CreatorSteps.GOV_CONFIG: {
        const { govModule, govToken, essentials } = state;

        const isEssentialsComplete = !!essentials.daoName.trim();
        const isGovTokenComplete =
          !!govToken.tokenName.trim() &&
          !!govToken.tokenSymbol.trim() &&
          govToken.tokenSupply.gt(0) &&
          govToken.tokenAllocations
            .map(tokenAllocation => tokenAllocation.amount)
            .reduce((prev, curr) => prev.add(curr), BigNumber.from(0))
            .lte(govToken.tokenSupply);
        const isGovModuleComplete =
          govModule.proposalThreshold.gte(0) &&
          govModule.quorum.gte(0) &&
          govModule.quorum.lte(100) &&
          govModule.executionDelay.gte(0) &&
          govModule.lateQuorumExecution.gte(0) &&
          govModule.voteStartDelay.gte(0) &&
          govModule.votingPeriod.gt(0);
        setIsDisabled(!isEssentialsComplete && !isGovModuleComplete && !isGovTokenComplete);
        break;
      }
      case CreatorSteps.GNOSIS_GOVERNANCE: {
        const {
          gnosis: { trustedAddresses, signatureThreshold },
        } = state;

        const isTrustedAddressValid =
          !trustedAddresses.some(trustee => trustee.error || !trustee.address.trim()) &&
          !!trustedAddresses.length;

        const isSignatureThresholdValid =
          Number(signatureThreshold) > 0 && Number(signatureThreshold) <= trustedAddresses.length;

        setIsDisabled(!isTrustedAddressValid || !isSignatureThresholdValid);
        break;
      }
    }
  }, [state]);

  return isNextDisbled;
}
