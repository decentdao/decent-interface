import { FractalUsul__factory, FractalUsul } from '@fractal-framework/fractal-contracts';
import { useState, useEffect, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { GnosisModuleType, IGnosisModuleData } from '../../../providers/Fractal/types';

export function getUsulModuleFromModules(modules: IGnosisModuleData[]) {
  const usulModule = modules.find(module => module.moduleType === GnosisModuleType.USUL);
  return usulModule;
}

export default function useUsul() {
  const [usulContract, setUsulContract] = useState<FractalUsul>();
  const [votingStrategiesAddresses, setVotingStrategiesAddresses] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  const {
    gnosis: { modules },
  } = useFractal();

  useEffect(() => {
    const init = async () => {
      if (!signerOrProvider || !modules) {
        return;
      }

      const usulModule = getUsulModuleFromModules(modules);

      if (!usulModule) {
        setIsLoaded(true);
        return;
      }

      try {
        const moduleContract = FractalUsul__factory.connect(
          usulModule.moduleAddress,
          signerOrProvider
        );
        const [strategies] = await moduleContract.getStrategiesPaginated(
          '0x0000000000000000000000000000000000000001',
          10
        );

        setUsulContract(moduleContract);
        setVotingStrategiesAddresses(strategies);
      } catch (e) {
        console.error(e);
      }

      setIsLoaded(true);
    };
    init();
  }, [modules, signerOrProvider]);

  return {
    usulContract,
    votingStrategiesAddresses,
    isLoaded,
  };
}
