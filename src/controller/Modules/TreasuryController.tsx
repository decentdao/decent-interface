import { useState, useEffect } from 'react';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { TreasuryModuleProvider } from '../../providers/treasury/TreasuryModuleProvider';
import { GnosisWrapperProvider } from '../../providers/gnosis/GnosisWrapperProvider';
import { TreasuryInjector } from './injectors/TreasuryInjector';
import { GnosisTreasuryInjector } from './injectors/GnosisTreasuryInjector';
import { ModuleTypes } from './types';

export function TreasuryController({ children }: { children: JSX.Element }) {
  const {
    modules: { treasuryModule, gnosisWrapperModule },
  } = useFractal();

  const [moduleType, setModuleType] = useState<ModuleTypes>();

  useEffect(() => {
    if (!!treasuryModule) {
      setModuleType(treasuryModule.moduleType);
    } else if (!!gnosisWrapperModule) {
      setModuleType(gnosisWrapperModule.moduleType);
    }
  }, [gnosisWrapperModule, treasuryModule]);

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
      return children;
    }
  }
}
