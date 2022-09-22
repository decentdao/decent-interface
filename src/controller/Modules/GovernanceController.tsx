import { useEffect, useState } from 'react';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisWrapperProvider } from '../../providers/gnosis/GnosisWrapperProvider';
import { GovernorModuleProvider } from '../../providers/govenor/GovenorModuleProvider';
import { GnosisGovernanceInjector } from './injectors/GnosisGovernanceInjector';
import { GovernanceInjector } from './injectors/TokenGovernanceInjector';
import { TreasuryController } from './TreasuryController';
import { ModuleTypes } from './types';

/**
 * Insures that the correct governor module provider is wrapping the plugins
 * by checking for what modules have been installed
 * @returns children wrapped in propoer governance provider with any other modules.
 */
export function GovernanceController({ children }: { children: JSX.Element }) {
  const {
    modules: {
      tokenVotingGovernanceModule,
      treasuryModule,
      timelockModule,
      claimingContractModule,
      gnosisWrapperModule,
    },
  } = useFractal();

  const [moduleType, setModuleType] = useState<ModuleTypes>();

  useEffect(() => {
    if (!!tokenVotingGovernanceModule && !!timelockModule && !!treasuryModule) {
      setModuleType(tokenVotingGovernanceModule.moduleType);
    } else if (!!gnosisWrapperModule) {
      setModuleType(gnosisWrapperModule.moduleType);
    }
  }, [tokenVotingGovernanceModule, gnosisWrapperModule, timelockModule, treasuryModule]);

  switch (moduleType) {
    case ModuleTypes.TOKEN_VOTING_GOVERNANCE:
      return (
        <GovernorModuleProvider
          moduleAddress={tokenVotingGovernanceModule!.moduleAddress}
          timeLockModuleAddress={timelockModule!.moduleAddress}
          claimingContractAddress={claimingContractModule?.moduleAddress}
        >
          <TreasuryController>
            <GovernanceInjector>{children}</GovernanceInjector>
          </TreasuryController>
        </GovernorModuleProvider>
      );
    case ModuleTypes.GNOSIS_WRAPPER:
      return (
        <GnosisWrapperProvider moduleAddress={gnosisWrapperModule!.moduleAddress}>
          <TreasuryController>
            <GnosisGovernanceInjector>{children}</GnosisGovernanceInjector>
          </TreasuryController>
        </GnosisWrapperProvider>
      );
    default: {
      return null;
    }
  }
}
