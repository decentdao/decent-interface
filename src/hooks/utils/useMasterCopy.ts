import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { Contract } from 'ethers';
import { useCallback } from 'react';
import { Address, zeroAddress } from 'viem';
// import { Address, getAddress, zeroAddress } from 'viem';
import { getEventRPC } from '../../helpers';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
// import { CacheExpiry, CacheKeys } from './cache/cacheDefaults';
// import { getValue, setValue } from './cache/useLocalStorage';

export function useMasterCopy() {
  const { baseContracts } = useFractal();
  const {
    // chain,
    contracts: { zodiacModuleProxyFactoryOld },
  } = useNetworkConfig();

  const isOzLinearVoting = useCallback(
    (masterCopyAddress: Address) =>
      masterCopyAddress === baseContracts?.linearVotingMasterCopyContract.asProvider.address,
    [baseContracts],
  );
  const isOzLinearVotingERC721 = useCallback(
    (masterCopyAddress: Address) =>
      masterCopyAddress === baseContracts?.linearVotingERC721MasterCopyContract.asProvider.address,
    [baseContracts],
  );
  const isMultisigFreezeGuard = useCallback(
    (masterCopyAddress: Address) =>
      masterCopyAddress === baseContracts?.multisigFreezeGuardMasterCopyContract.asProvider.address,
    [baseContracts],
  );
  const isMultisigFreezeVoting = useCallback(
    (masterCopyAddress: Address) =>
      masterCopyAddress ===
      baseContracts?.freezeMultisigVotingMasterCopyContract.asProvider.address,
    [baseContracts],
  );
  const isERC721FreezeVoting = useCallback(
    (masterCopyAddress: Address) =>
      masterCopyAddress === baseContracts?.freezeERC721VotingMasterCopyContract.asProvider.address,
    [baseContracts],
  );
  const isAzorius = useCallback(
    (masterCopyAddress: Address) =>
      masterCopyAddress === baseContracts?.fractalAzoriusMasterCopyContract.asProvider.address,
    [baseContracts],
  );
  const isFractalModule = useCallback(
    (masterCopyAddress: Address) =>
      masterCopyAddress === baseContracts?.fractalModuleMasterCopyContract.asProvider.address,
    [baseContracts],
  );

  const getMasterCopyAddress = useCallback(async function (
    contract: Contract,
    proxyAddress: Address,
  ): Promise<[Address, string | null]> {
    // const cachedValue = getValue({
    //   cacheName: CacheKeys.MASTER_COPY,
    //   chainId: chain.id,
    //   moduleProxyFactoryAddress: getAddress(contract.address),
    //   proxyAddress,
    // });
    // if (cachedValue) return [cachedValue, null] as const;

    const filter = contract.filters.ModuleProxyCreation(proxyAddress, null);
    return contract.queryFilter(filter).then(proxiesCreated => {
      if (proxiesCreated.length === 0) {
        // @dev to prevent redundant queries, cache the master copy address as AddressZero if no proxies were created
        // setValue(
        //   {
        //     cacheName: CacheKeys.MASTER_COPY,
        //     chainId: chain.id,
        //     moduleProxyFactoryAddress: getAddress(contract.address),
        //     proxyAddress,
        //   },
        //   zeroAddress,
        //   CacheExpiry.ONE_WEEK,
        // );
        return [zeroAddress, 'No proxies created'] as const;
      }
      const masterCopyAddress = proxiesCreated[0].args!.masterCopy;
      // setValue(
      //   {
      //     cacheName: CacheKeys.MASTER_COPY,
      //     chainId: chain.id,
      //     moduleProxyFactoryAddress: getAddress(contract.address),
      //     proxyAddress,
      //   },
      //   masterCopyAddress,
      // );
      return [masterCopyAddress, null] as const;
    });
  }, []);

  const getZodiacModuleProxyMasterCopyData = useCallback(
    async function (proxyAddress: Address) {
      let masterCopyAddress: Address = zeroAddress;
      let error: string | null = null;
      if (baseContracts) {
        const contract = getEventRPC<ModuleProxyFactory>(
          baseContracts?.zodiacModuleProxyFactoryContract,
        );
        [masterCopyAddress, error] = await getMasterCopyAddress(contract, proxyAddress);
        // @dev checks Zodiac's ModuleProxyFactory Contract if the first one fails.
        if (error) {
          const moduleProxyFactoryOld = contract.attach(zodiacModuleProxyFactoryOld);
          [masterCopyAddress, error] = await getMasterCopyAddress(
            moduleProxyFactoryOld,
            proxyAddress,
          );
        }
        if (error) {
          console.error(error);
        }
      }
      return {
        address: masterCopyAddress,
        isOzLinearVoting: isOzLinearVoting(masterCopyAddress),
        isOzLinearVotingERC721: isOzLinearVotingERC721(masterCopyAddress),
        isMultisigFreezeGuard: isMultisigFreezeGuard(masterCopyAddress),
        isMultisigFreezeVoting: isMultisigFreezeVoting(masterCopyAddress),
        isERC721FreezeVoting: isERC721FreezeVoting(masterCopyAddress),
        isAzorius: isAzorius(masterCopyAddress),
        isFractalModule: isFractalModule(masterCopyAddress),
      };
    },
    [
      getMasterCopyAddress,
      isAzorius,
      isFractalModule,
      isERC721FreezeVoting,
      isMultisigFreezeGuard,
      isMultisigFreezeVoting,
      isOzLinearVoting,
      isOzLinearVotingERC721,
      baseContracts,
      zodiacModuleProxyFactoryOld,
    ],
  );

  return { getZodiacModuleProxyMasterCopyData };
}
