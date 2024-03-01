import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalModuleData, FractalModuleType } from '../../../types';
import { useMasterCopy } from '../../utils/useMasterCopy';

export const useFractalModules = () => {
  const {
    baseContracts: { fractalAzoriusMasterCopyContract, fractalModuleMasterCopyContract },
  } = useFractal();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const lookupModules = useCallback(
    async (_moduleAddresses: string[]) => {
      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddress => {
          const masterCopyData = await getZodiacModuleProxyMasterCopyData(moduleAddress);

          let safeModule: FractalModuleData;

          if (masterCopyData.isAzorius) {
            safeModule = {
              moduleContract: fractalAzoriusMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.AZORIUS,
            };
          } else if (masterCopyData.isFractalModule) {
            safeModule = {
              moduleContract: fractalModuleMasterCopyContract.asSigner.attach(moduleAddress),
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
        })
      );
      return modules;
    },
    [
      fractalAzoriusMasterCopyContract,
      fractalModuleMasterCopyContract,
      getZodiacModuleProxyMasterCopyData,
    ]
  );
  return lookupModules;
};
