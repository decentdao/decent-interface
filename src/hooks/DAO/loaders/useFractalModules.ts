import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { constants, utils } from 'ethers';
import { useCallback } from 'react';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalModuleData, FractalModuleType } from '../../../types';
import { useLocalStorage } from './../../utils/cache/useLocalStorage';

export const useFractalModules = () => {
  const {
    baseContracts: {
      zodiacModuleProxyFactoryContract,
      fractalAzoriusMasterCopyContract,
      fractalModuleMasterCopyContract,
    },
  } = useFractal();
  const { setValue, getValue } = useLocalStorage();

  const lookupModules = useCallback(
    async (_moduleAddresses: string[]) => {
      const rpc = getEventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract);
      const getMasterCopyAddress = async (proxyAddress: string): Promise<string> => {
        const cachedValue = getValue('master_copy_of_' + proxyAddress);
        if (cachedValue) return cachedValue;
        const filter = rpc.filters.ModuleProxyCreation(proxyAddress, null);
        return rpc.queryFilter(filter).then(proxiesCreated => {
          if (proxiesCreated.length === 0) return constants.AddressZero;
          setValue('master_copy_of_' + proxyAddress, proxiesCreated[0].args.masterCopy);
          return proxiesCreated[0].args.masterCopy;
        });
      };

      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddress => {
          const masterCopyAddress = await getMasterCopyAddress(moduleAddress);

          let safeModule: FractalModuleData;

          if (
            utils.getAddress(masterCopyAddress) ===
            fractalAzoriusMasterCopyContract.asSigner.address
          ) {
            safeModule = {
              moduleContract: fractalAzoriusMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.AZORIUS,
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
      fractalAzoriusMasterCopyContract,
      fractalModuleMasterCopyContract,
      getValue,
      setValue,
    ]
  );
  return lookupModules;
};
