import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { Address, getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { SENTINEL_ADDRESS } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { FractalModuleData } from '../../types';
import { getAzoriusModuleFromModules } from '../../utils';
import { useFractalModules } from '../DAO/loaders/useFractalModules';
import { useAddressContractType } from './useAddressContractType';

const useVotingStrategiesAddresses = () => {
  const { node } = useFractal();
  const publicClient = usePublicClient();
  const safeAPI = useSafeAPI();
  const { getAddressContractType } = useAddressContractType();
  const lookupModules = useFractalModules();

  const getVotingStrategies = useCallback(
    async (safeAddress?: Address) => {
      let azoriusModule: FractalModuleData | undefined;

      if (safeAddress) {
        if (!safeAPI) {
          throw new Error('Safe API not ready');
        }
        const safeInfo = await safeAPI.getSafeInfo(safeAddress);
        const safeModules = await lookupModules(safeInfo.modules);
        azoriusModule = getAzoriusModuleFromModules(safeModules);
      } else {
        azoriusModule = getAzoriusModuleFromModules(node.fractalModules);
      }

      if (!azoriusModule || !publicClient) {
        return;
      }

      const azoriusContract = getContract({
        abi: abis.Azorius,
        address: azoriusModule.moduleAddress,
        client: publicClient,
      });

      const [strategies, nextStrategy] = await azoriusContract.read.getStrategies([
        SENTINEL_ADDRESS,
        3n,
      ]);
      const result = Promise.all(
        [...strategies, nextStrategy]
          .filter(
            strategyAddress =>
              strategyAddress !== SENTINEL_ADDRESS && strategyAddress !== zeroAddress,
          )
          .map(async strategyAddress => ({
            ...(await getAddressContractType(strategyAddress)),
            strategyAddress,
          })),
      );
      return result;
    },
    [lookupModules, getAddressContractType, node.fractalModules, publicClient, safeAPI],
  );

  return { getVotingStrategies };
};

export default useVotingStrategiesAddresses;
