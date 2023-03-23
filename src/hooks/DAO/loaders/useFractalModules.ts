import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalModuleData, FractalModuleType } from '../../../types';
export const useFractalModules = () => {
  const {
    network: { chainId },
  } = useProvider();
  const {
    baseContracts: {
      zodiacModuleProxyFactoryContract,
      fractalUsulMasterCopyContract,
      fractalModuleMasterCopyContract,
    },
  } = useFractal();

  const lookupModules = useCallback(
    async (_moduleAddresses: string[]) => {
      const rpc = getEventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract, chainId);
      const getMasterCopyAddress = async (proxyAddress: string): Promise<string> => {
        const filter = rpc.filters.ModuleProxyCreation(proxyAddress, null);
        return rpc.queryFilter(filter).then(proxiesCreated => {
          return proxiesCreated[0].args.masterCopy;
        });
      };

      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddress => {
          const masterCopyAddress = await getMasterCopyAddress(moduleAddress);

          let safeModule: FractalModuleData;

          if (masterCopyAddress === fractalUsulMasterCopyContract.asSigner.address) {
            safeModule = {
              moduleContract: fractalUsulMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.USUL,
            };
          } else if (masterCopyAddress === fractalModuleMasterCopyContract.asSigner.address) {
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
      zodiacModuleProxyFactoryContract,
      fractalUsulMasterCopyContract,
      fractalModuleMasterCopyContract,
      chainId,
    ]
  );
  return lookupModules;
};
