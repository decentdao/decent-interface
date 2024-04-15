import { useCallback } from 'react';
import { Address, getContract } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalModuleData, FractalModuleType } from '../../../types';
import useContractClient from '../../utils/useContractClient';
import { useMasterCopy } from '../../utils/useMasterCopy';

export const useFractalModules = () => {
  const { baseContracts } = useFractal();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const { walletOrPublicClient } = useContractClient();
  const lookupModules = useCallback(
    async (_moduleAddresses: Address[]) => {
      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddress => {
          const masterCopyData = await getZodiacModuleProxyMasterCopyData(moduleAddress);

          let safeModule: FractalModuleData;

          if (masterCopyData.isAzorius && baseContracts && walletOrPublicClient) {
            const moduleContract = getContract({
              client: walletOrPublicClient,
              abi: baseContracts.fractalAzoriusMasterCopyContract.asPublic.abi,
              address: moduleAddress,
            });
            safeModule = {
              moduleContract,
              moduleAddress,
              moduleType: FractalModuleType.AZORIUS,
            };
          } else if (masterCopyData.isFractalModule && baseContracts && walletOrPublicClient) {
            const moduleContract = getContract({
              client: walletOrPublicClient,
              abi: baseContracts.fractalModuleMasterCopyContract.asPublic.abi,
              address: moduleAddress,
            });
            safeModule = {
              moduleContract,
              moduleAddress,
              moduleType: FractalModuleType.FRACTAL,
            };
          } else {
            safeModule = {
              moduleContract: undefined,
              moduleAddress,
              moduleType: FractalModuleType.UNKNOWN,
            };
          }

          return safeModule;
        }),
      );
      return modules;
    },
    [baseContracts, getZodiacModuleProxyMasterCopyData, walletOrPublicClient],
  );
  return lookupModules;
};
