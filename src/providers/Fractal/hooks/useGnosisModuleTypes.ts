import { FractalModule__factory } from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect } from 'react';
import { Usul__factory } from '../../../assets/typechain-types/usul';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction } from '../constants';
import { GnosisActions, GnosisModuleType, IGnosisModuleData } from '../types';

export function useGnosisModuleTypes(
  gnosisDispatch: Dispatch<GnosisActions>,
  moduleAddresses?: string[]
) {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

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
      !moduleAddresses ||
      !signerOrProvider
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

          let module: IGnosisModuleData;

          if (masterCopyAddress === usulMasterCopyContract.address) {
            module = {
              moduleContract: Usul__factory.connect(moduleAddress, signerOrProvider),
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
    signerOrProvider,
  ]);
}
