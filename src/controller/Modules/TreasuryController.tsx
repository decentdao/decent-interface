import { useState, useEffect, PropsWithChildren } from 'react';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { TreasuryModuleProvider } from '../../providers/treasury/TreasuryModuleProvider';
import { GnosisWrapperProvider } from '../../providers/gnosis/GnosisWrapperProvider';
import { TreasuryInjector } from './injectors/TreasuryInjector';
import { GnosisTreasuryInjector } from './injectors/GnosisTreasuryInjector';
import { ModuleTypes } from './types';

export function TreasuryController({ children }: PropsWithChildren) {
  const {
    modules: { tokenVotingGovernanceModule, treasuryModule, timelockModule, gnosisWrapperModule },
  } = useFractal();

  const [moduleType, setModuleType] = useState<ModuleTypes>();

  useEffect(() => {
    if (!!treasuryModule && !tokenVotingGovernanceModule) {
      setModuleType(treasuryModule.moduleType);
    } else if (!!gnosisWrapperModule) {
      setModuleType(gnosisWrapperModule.moduleType);
    }
  }, [tokenVotingGovernanceModule, gnosisWrapperModule, timelockModule, treasuryModule]);

  switch (moduleType) {
    case ModuleTypes.TREASURY: {
      return (
        <TreasuryModuleProvider moduleAddress={treasuryModule!.moduleAddress}>
          <TreasuryInjector>{children}</TreasuryInjector>
        </TreasuryModuleProvider>
      );
    }
    case ModuleTypes.GNOSIS_WRAPPER: {
      return (
        <GnosisWrapperProvider moduleAddress={gnosisWrapperModule!.moduleAddress}>
          <GnosisTreasuryInjector>{children}</GnosisTreasuryInjector>
        </GnosisWrapperProvider>
      );
    }
    default: {
      return <>{children}</>;
    }
  }
}
