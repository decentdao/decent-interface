import { FractalModule__factory, FractalUsul__factory } from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect, useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { GnosisAction } from '../constants';
import { GnosisActions, GnosisModuleType, IGnosisModuleData } from '../types';

export function useGnosisModuleTypes(
  gnosisDispatch: Dispatch<GnosisActions>,
  moduleAddresses?: string[]
) {
  const provider = useProvider();
  const { data } = useSigner();
  const signerOrProvider = useMemo(() => data || provider, [data, provider]);

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
        !fractalModuleMasterCopyContract ||
        !signerOrProvider
      ) {
        return;
      }

      const getMasterCopyAddress = async (proxyAddress: string): Promise<string> => {
        const filter = zodiacModuleProxyFactoryContract.filters.ModuleProxyCreation(
          proxyAddress,
          null
        );

        return zodiacModuleProxyFactoryContract.queryFilter(filter).then(proxiesCreated => {
          return proxiesCreated[0].args.masterCopy;
        });
      };

      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddress => {
          const masterCopyAddress = await getMasterCopyAddress(moduleAddress);

          let module: IGnosisModuleData;

          if (masterCopyAddress === fractalUsulMasterCopyContract.address) {
            module = {
              moduleContract: FractalUsul__factory.connect(moduleAddress, signerOrProvider),
              moduleAddress: moduleAddress,
              moduleType: GnosisModuleType.USUL,
            };
          } else if (masterCopyAddress === fractalModuleMasterCopyContract.address) {
            module = {
              moduleContract: FractalModule__factory.connect(moduleAddress, signerOrProvider),
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
      signerOrProvider,
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
