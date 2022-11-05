import { Dispatch, useEffect } from 'react';
import useSafeContracts from '../../../hooks/useSafeContracts';
import { GnosisAction } from '../constants';
import { GnosisActions, GnosisModuleType, IGnosisModuleData } from '../types';

export function useGnosisModuleTypes(
  gnosisDispatch: Dispatch<GnosisActions>,
  moduleAddresses?: string[]
) {
  const {
    zodiacModuleProxyFactoryContract,
    usulMasterCopyContract,
    fractalModuleMasterCopyContract,
  } = useSafeContracts();

  useEffect(() => {
    if (
      !zodiacModuleProxyFactoryContract ||
      !usulMasterCopyContract ||
      !fractalModuleMasterCopyContract ||
      !moduleAddresses
    ) {
      return;
    }

    const getMasterCopyAddress = (proxyAddress: string): Promise<string> => {
      const filter = zodiacModuleProxyFactoryContract.filters.ModuleProxyCreation(
        proxyAddress,
        null
      );

      return zodiacModuleProxyFactoryContract.queryFilter(filter).then(proxiesCreated => {
        return proxiesCreated[0].args.masterCopy;
      });
    };

    (async () => {
      await Promise.all(
        moduleAddresses.map(async moduleAddress => {
          const masterCopyAddress = await getMasterCopyAddress(moduleAddress);

          const moduleType =
            masterCopyAddress === usulMasterCopyContract.address
              ? GnosisModuleType.USUL
              : masterCopyAddress === fractalModuleMasterCopyContract.address
              ? GnosisModuleType.FRACTAL
              : GnosisModuleType.UNKNOWN;

          return {
            moduleAddress,
            moduleType,
          } as IGnosisModuleData;
        })
      ).then(modules => {
        gnosisDispatch({
          type: GnosisAction.SET_MODULES,
          payload: modules,
        });
      });
    })();
  }, [
    zodiacModuleProxyFactoryContract,
    usulMasterCopyContract,
    fractalModuleMasterCopyContract,
    moduleAddresses,
    gnosisDispatch,
  ]);
}
