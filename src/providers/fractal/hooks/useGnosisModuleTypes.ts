import { GnosisModuleTypes } from '../../../controller/Modules/types/enums';
import { useEffect, useMemo, useState } from 'react';
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
              ? GnosisModuleTypes.USUL
              : masterCopyAddress === fractalModuleMasterCopyContract.address
              ? GnosisModuleTypes.FRACTAL
              : GnosisModuleTypes.UNKNOWN;

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
    moduleAddresses,
    fractalModuleMasterCopyContract,
  ]);

  const usulModule = useMemo(
    () => modules.find(v => v.moduleType === GnosisModuleTypes.USUL),
    [modules]
  );
  const fractalModule = useMemo(
    () => modules.find(v => v.moduleType === GnosisModuleTypes.FRACTAL),
    [modules]
  );
  const unknownModule = useMemo(
    () => modules.find(v => v.moduleType === GnosisModuleTypes.UNKNOWN),
    [modules]
  );

  return {
    usulModule,
    fractalModule,
    unknownModule,
  };
}
