import { GnosisModuleType } from '../../../controller/Modules/types/enums';
import { useEffect, useState } from 'react';
import { IGnosisModuleData } from '../../../controller/Modules/types';
import useSafeContracts from '../../../hooks/useSafeContracts';

// @todo move to global hooks folder
export function useGnosisModuleTypes(moduleAddresses?: string[]) {
  const {
    zodiacModuleProxyFactoryContract,
    usulMasterCopyContract,
    fractalModuleMasterCopyContract,
  } = useSafeContracts();

  const [modules, setModules] = useState<IGnosisModuleData[]>([]);

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
      ).then(setModules);
    })();
  }, [
    zodiacModuleProxyFactoryContract,
    usulMasterCopyContract,
    fractalModuleMasterCopyContract,
    moduleAddresses,
  ]);

  return modules;
}
