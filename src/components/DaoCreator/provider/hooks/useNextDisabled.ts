import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { CreatorState, CreatorSteps, GovernanceTypes } from './../types';

/**
 * This hook updates the next page button's disable state for each form
 * @param state
 * @returns
 */
export function useNextDisabled(state: CreatorState) {
  const [isNextDisbled, setIsDisabled] = useState(true);

  useEffect(() => {
    const {
      govModule,
      govToken,
      essentials,
      gnosis: { trustedAddresses, signatureThreshold },
    } = state;
    const isGnosisWithUsul = state.governance === GovernanceTypes.GNOSIS_SAFE_USUL;
    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
        if (!!state.essentials.daoName.trim()) {
          setIsDisabled(false);
          break;
        }
        setIsDisabled(true);
        break;
      case CreatorSteps.CHOOSE_GOVERNANCE: {
        setIsDisabled(false);
        break;
      }
      case CreatorSteps.FUNDING:
        setIsDisabled(false);
        break;
      case CreatorSteps.GNOSIS_WITH_USUL:
        if (govToken) {
          if (!govToken.tokenName || !govToken.tokenSymbol) {
            setIsDisabled(true);
            break;
          }
          if (!govToken.tokenAllocations || !govToken.tokenSupply.bigNumberValue) {
            setIsDisabled(true);
            break;
          }
          if (govToken.tokenSupply.bigNumberValue && govToken.tokenSupply.bigNumberValue.isZero()) {
            setIsDisabled(true);
            break;
          }

          let isAddressesValid = true;
          govToken.tokenAllocations
            .map(tokenAllocation => tokenAllocation.isValidAddress)
            .every(isValidAddress => {
              if (!isValidAddress) {
                isAddressesValid = false;
                return false;
              }
            });
          if (!govToken.tokenAllocations.length || !isAddressesValid) {
            setIsDisabled(true);
            break;
          }

          const totalAllocations = govToken.tokenAllocations
            .map(tokenAllocation => tokenAllocation.amount.bigNumberValue || BigNumber.from(0))
            .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));

          const isAllocationsValid =
            !totalAllocations.isZero() &&
            totalAllocations
              .add(govToken.parentAllocationAmount?.bigNumberValue || 0)
              .lte(govToken.tokenSupply.bigNumberValue!);

          setIsDisabled(!isAllocationsValid);
          break;
        }
        setIsDisabled(true);
        break;
      case CreatorSteps.GOV_CONFIG: {
        const isEssentialsComplete = !!essentials.daoName.trim();
        const totalAllocations = govToken.tokenAllocations
          .map(tokenAllocation => tokenAllocation.amount.bigNumberValue || BigNumber.from(0))
          .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));
        const isGovTokenComplete =
          !!govToken.tokenName.trim() &&
          !!govToken.tokenSymbol.trim() &&
          state.govToken.tokenSupply.bigNumberValue!.gt(0) &&
          govToken.tokenAllocations.length &&
          !totalAllocations.isZero() &&
          totalAllocations.lte(state.govToken.tokenSupply.bigNumberValue!);
        const isGovModuleComplete =
          govModule.quorumPercentage.gte(0) &&
          govModule.quorumPercentage.lte(100) &&
          govModule.executionDelay.gte(0) &&
          govModule.votingPeriod.gt(isGnosisWithUsul ? 1 : 0);
        setIsDisabled(!isEssentialsComplete || !isGovModuleComplete || !isGovTokenComplete);
        break;
      }
      case CreatorSteps.GNOSIS_GOVERNANCE:
      case CreatorSteps.PURE_GNOSIS: {
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
