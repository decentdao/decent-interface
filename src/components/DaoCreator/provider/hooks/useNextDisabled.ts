import { BigNumber, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { CreatorState, CreatorSteps } from './../types';

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
          if (!govToken.tokenAllocations || !govToken.tokenSupply) {
            setIsDisabled(true);
            break;
          }
          if (govToken.tokenSupply.isZero()) {
            setIsDisabled(true);
            break;
          }

          const isAddressesInValid = govToken.tokenAllocations.some(
            allocation => !allocation.isValidAddress || !utils.isAddress(allocation.address)
          );
          if (!govToken.tokenAllocations.length || isAddressesInValid) {
            setIsDisabled(true);
            break;
          }

          const totalAllocations = govToken.tokenAllocations
            .map(tokenAllocation => tokenAllocation.amount || BigNumber.from(0))
            .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));

          const isTokenAmountsInvalid = govToken.tokenAllocations.some(allocation =>
            allocation.amount?.isZero()
          );

          const isAllocationsValid =
            !isTokenAmountsInvalid &&
            totalAllocations.add(govToken.parentAllocationAmount || 0).lte(govToken.tokenSupply);
          setIsDisabled(!isAllocationsValid);
          break;
        }

        setIsDisabled(true);
        break;
      case CreatorSteps.GOV_CONFIG: {
        const isEssentialsComplete = !!essentials.daoName.trim();
        const totalAllocations = govToken.tokenAllocations
          .map(tokenAllocation => tokenAllocation.amount || BigNumber.from(0))
          .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));
        const isGovTokenComplete =
          !!govToken.tokenName.trim() &&
          !!govToken.tokenSymbol.trim() &&
          state.govToken.tokenSupply?.gt(0) &&
          govToken.tokenAllocations.length &&
          !totalAllocations.isZero() &&
          totalAllocations.lte(state.govToken.tokenSupply || 0);
        const isGovModuleComplete =
          govModule.quorumPercentage.gte(0) &&
          govModule.quorumPercentage.lte(100) &&
          govModule.timelock.gte(0) &&
          govModule.votingPeriod.gt(0); //votingPeriod must be great than 1 second for Usul, votingPeriod is in minutes.
        setIsDisabled(!isEssentialsComplete || !isGovModuleComplete || !isGovTokenComplete);
        break;
      }
      case CreatorSteps.GNOSIS_GOVERNANCE:
      case CreatorSteps.PURE_GNOSIS: {
        const isTrustedAddressValid =
          !trustedAddresses.some(trustee => !trustee.isValidAddress || !trustee.address.trim()) &&
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
