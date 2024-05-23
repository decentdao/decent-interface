import { useCallback } from 'react';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import FractalModuleAbi from '../../../assets/abi/FractalModule';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalModuleData, FractalModuleType } from '../../../types';
import { useMasterCopy } from '../../utils/useMasterCopy';

export const useFractalModules = () => {
  const { baseContracts } = useFractal();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const publicClient = usePublicClient();
  const lookupModules = useCallback(
    async (_moduleAddresses: string[]) => {
      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddress => {
          const masterCopyData = await getZodiacModuleProxyMasterCopyData(
            getAddress(moduleAddress),
          );

          let safeModule: FractalModuleData;

          if (masterCopyData.isAzorius && baseContracts) {
            safeModule = {
              moduleContract:
                baseContracts.fractalAzoriusMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.AZORIUS,
            };
          } else if (masterCopyData.isFractalModule && publicClient) {
            safeModule = {
              moduleContract: getContract({
                abi: FractalModuleAbi,
                address: getAddress(moduleAddress),
                client: publicClient,
              }),
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.FRACTAL,
            };
          } else {
            safeModule = {
              moduleContract: undefined,
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.UNKNOWN,
            };
          }

          return safeModule;
        }),
      );
      return modules;
    },
    [baseContracts, getZodiacModuleProxyMasterCopyData, publicClient],
  );
  return lookupModules;
};
