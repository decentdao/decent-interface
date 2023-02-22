import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect, useCallback } from 'react';
import { eventRPC } from '../../../helpers';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { GnosisAction } from '../constants';
import { GnosisActions, GnosisModuleType, IGnosisModuleData } from '../types';

export function useGnosisModuleTypes(
  gnosisDispatch: Dispatch<GnosisActions>,
  chainId: number,
  moduleAddresses?: string[]
) {
  const {
    zodiacModuleProxyFactoryContract,
    fractalUsulMasterCopyContract,
    fractalModuleMasterCopyContract,
  } = useSafeContracts();

  const lookupModules = useCallback(
    async (_moduleAddresses: string[]) => {
      if (
        !zodiacModuleProxyFactoryContract ||
        !fractalUsulMasterCopyContract ||
        !fractalModuleMasterCopyContract
      ) {
        return;
      }

      const rpc = eventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract, chainId);
      const getMasterCopyAddress = async (proxyAddress: string): Promise<string> => {
        const filter = rpc.filters.ModuleProxyCreation(proxyAddress, null);
        return rpc.queryFilter(filter).then(proxiesCreated => {
          return proxiesCreated[0].args.masterCopy;
        });
      };

      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddress => {
          const masterCopyAddress = await getMasterCopyAddress(moduleAddress);

          let module: IGnosisModuleData;

          if (masterCopyAddress === fractalUsulMasterCopyContract.asSigner.address) {
            module = {
              moduleContract: fractalUsulMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleType.USUL,
            };
          } else if (masterCopyAddress === fractalModuleMasterCopyContract.asSigner.address) {
            module = {
              moduleContract: fractalModuleMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleType.FRACTAL,
            };
          } else {
            module = {
              moduleContract: undefined,
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleType.UNKNOWN,
            };
          }

          return module;
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

  useEffect(() => {
    if (!moduleAddresses) {
      return;
    }
    lookupModules(moduleAddresses).then(modules => {
      if (!!modules)
        gnosisDispatch({
          type: GnosisAction.SET_MODULES,
          payload: modules,
        });
    });
  }, [gnosisDispatch, lookupModules, moduleAddresses]);

  return { lookupModules };
}
