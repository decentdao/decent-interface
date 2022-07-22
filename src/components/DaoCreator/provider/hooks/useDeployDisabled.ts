import { useState, useEffect } from 'react';
import { CreatorState, CreatorSteps } from './../types';

// This hook will track form progress and ensure data is validated before allowing submission
export function useDeployDisabled(state: CreatorState) {
  const [isDeployedEnabled, setIsDisabled] = useState(false);

  useEffect(() => {
    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
      case CreatorSteps.FUNDING:
      case CreatorSteps.TREASURY_GOV_TOKEN:
      case CreatorSteps.GOV_CONFIG:
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
        setIsDisabled(isEssentialsComplete && isGovModuleComplete && isGovTokenComplete);
    }
  }, [state]);
  return isDeployedEnabled;
}
