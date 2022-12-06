import { FractalUsul__factory, FractalUsul } from '@fractal-framework/fractal-contracts';
import { useState, useEffect } from 'react';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisModuleType } from '../types';
import { useFractal } from './useFractal';

export default function useUsul() {
  const [usulContract, setUsulContract] = useState<FractalUsul>();
  const [votingStrategiesAddresses, setVotingStrategiesAddresses] = useState<string[]>([]);

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const {
    gnosis: { modules },
  } = useFractal();

  useEffect(() => {
    const init = async () => {
      if (!signerOrProvider || !modules) {
        return;
      }

      const usulModule = modules.find(module => module.moduleType === GnosisModuleType.USUL);

      if (!usulModule) {
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
    };
    init();
  }, [modules, signerOrProvider]);

  return {
    usulContract,
    votingStrategiesAddresses,
  };
}
