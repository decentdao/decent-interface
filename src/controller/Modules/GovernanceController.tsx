import { useEffect, useState } from 'react';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GovernorModuleProvider } from '../../providers/govenor/GovenorModuleProvider';
import { TreasuryModuleProvider } from '../../providers/treasury/TreasuryModuleProvider';
import { GovernanceInjector } from './GovernanceInjector';
import { ModuleTypes } from './types';

export function GovernanceController({ children }: { children: JSX.Element }) {
  const {
    modules: {
      tokenVotingGovernanceModule,
      treasuryModule,
      timelockModule,
      claimingContractModule,
    },
  } = useFractal();

  const [moduleType, setModuleType] = useState<ModuleTypes>();

  useEffect(() => {
    if (
      !!tokenVotingGovernanceModule?.moduleAddress &&
      !!treasuryModule?.moduleAddress &&
      !!timelockModule?.moduleAddress
    ) {
      setModuleType(tokenVotingGovernanceModule.moduleType);
    }
  }, [tokenVotingGovernanceModule, treasuryModule, timelockModule]);

  switch (moduleType) {
    case ModuleTypes.TOKEN_VOTING_GOVERNANCE:
      return (
        <GovernorModuleProvider
          moduleAddress={tokenVotingGovernanceModule!.moduleAddress}
          timeLockModuleAddress={timelockModule!.moduleAddress}
          claimingContractAddress={claimingContractModule?.moduleAddress}
        >
          <TreasuryModuleProvider moduleAddress={treasuryModule!.moduleAddress}>
            <GovernanceInjector>{children}</GovernanceInjector>
          </TreasuryModuleProvider>
        </GovernorModuleProvider>
      );
    default:
      return children;
  }
}
