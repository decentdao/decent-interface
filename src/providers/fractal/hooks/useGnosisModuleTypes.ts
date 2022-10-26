import { GnosisModuleTypes } from '../../../controller/Modules/types/enums';
import { useEffect, useMemo, useState } from 'react';
import { IGnosisModuleData } from '../../../controller/Modules/types';
import useSafeContracts from '../../../hooks/useSafeContracts';

// @todo move to global hooks folder
export function useGnosisModuleTypes(moduleAddresses?: string[]) {
  const { zodiacModuleProxyFactoryContract, usulMastercopyContract } = useSafeContracts();

  const [modules, setModules] = useState<IGnosisModuleData[]>([]);

  useEffect(() => {
    if (!zodiacModuleProxyFactoryContract || !usulMastercopyContract || !moduleAddresses) {
      return;
    }

    const getMasterCopyAddress = (proxyAddress: string) => {
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

          if (masterCopyAddress === usulMastercopyContract.address) {
            return {
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleTypes.USUL,
            } as IGnosisModuleData;
          } else {
            return {
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleTypes.UNKNOWN,
            } as IGnosisModuleData;
          }
        })
      ).then(setModules);
    })();
  }, [zodiacModuleProxyFactoryContract, usulMastercopyContract, moduleAddresses]);

  const usulModule = useMemo(
    () => modules.find(v => v.moduleType === GnosisModuleTypes.USUL),
    [modules]
  );
  const unknownModule = useMemo(
    () => modules.find(v => v.moduleType === GnosisModuleTypes.UNKNOWN),
    [modules]
  );

  return {
    usulModule,
    unknownModule,
  };
}
