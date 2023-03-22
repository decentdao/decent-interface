import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect, useCallback } from 'react';
import { getEventRPC } from '../../../helpers';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { GnosisActions, IGnosisModuleData, GnosisModuleType, GnosisAction } from '../../../types';

export function useGnosisModuleTypes(
  chainId: number,
  moduleAddresses?: string[],
  gnosisDispatch?: Dispatch<GnosisActions>
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

          let safeModule: IGnosisModuleData;

          if (masterCopyAddress === fractalUsulMasterCopyContract.asSigner.address) {
            safeModule = {
              moduleContract: fractalUsulMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleType.USUL,
            };
          } else if (masterCopyAddress === fractalModuleMasterCopyContract.asSigner.address) {
            safeModule = {
              moduleContract: fractalModuleMasterCopyContract.asSigner.attach(moduleAddress),
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleType.FRACTAL,
            };
          } else {
            safeModule = {
              moduleContract: undefined,
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleType.UNKNOWN,
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

  useEffect(() => {
    if (!moduleAddresses) {
      return;
    }
    lookupModules(moduleAddresses).then(modules => {
      if (!!modules && gnosisDispatch) {
        gnosisDispatch({
          type: GnosisAction.SET_MODULES,
          payload: modules,
        });
      }
    });
  }, [gnosisDispatch, lookupModules, moduleAddresses]);

  return { lookupModules };
}
