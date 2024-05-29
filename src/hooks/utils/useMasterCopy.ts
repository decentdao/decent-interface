import { useCallback } from 'react';
import { Address, getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import ModuleProxyFactoryAbi from '../../assets/abi/ModuleProxyFactory';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { CacheExpiry, CacheKeys } from './cache/cacheDefaults';
import { useLocalStorage } from './cache/useLocalStorage';

export function useMasterCopy() {
  const { getValue, setValue } = useLocalStorage();
  const { baseContracts } = useFractal();
  const {
    contracts: {
      zodiacModuleProxyFactory,
      linearVotingMasterCopy,
      linearVotingERC721MasterCopy,
      fractalModuleMasterCopy,
      fractalAzoriusMasterCopy,
    },
  } = useNetworkConfig();
  const publicClient = usePublicClient();

  const isOzLinearVoting = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === linearVotingMasterCopy,
    [linearVotingMasterCopy],
  );
  const isOzLinearVotingERC721 = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === linearVotingERC721MasterCopy,
    [linearVotingERC721MasterCopy],
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
    (masterCopyAddress: Address) => masterCopyAddress === fractalAzoriusMasterCopy,
    [fractalAzoriusMasterCopy],
  );
  const isFractalModule = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === fractalModuleMasterCopy,
    [fractalModuleMasterCopy],
  );

  const getMasterCopyAddress = useCallback(
    async function (proxyAddress: Address): Promise<readonly [Address, string | null]> {
      if (!publicClient) {
        return [zeroAddress, null] as const;
      }

      const cachedValue = getValue(CacheKeys.MASTER_COPY_PREFIX + proxyAddress);
      if (cachedValue) {
        return [cachedValue, null] as const;
      }

      const moduleProxyFactoryContract = getContract({
        abi: ModuleProxyFactoryAbi,
        address: zodiacModuleProxyFactory,
        client: publicClient,
      });

      return moduleProxyFactoryContract.getEvents
        .ModuleProxyCreation({ proxy: proxyAddress })
        .then(proxiesCreated => {
          // @dev to prevent redundant queries, cache the master copy address as AddressZero if no proxies were created
          if (proxiesCreated.length === 0) {
            setValue(
              CacheKeys.MASTER_COPY_PREFIX + proxyAddress,
              zeroAddress,
              CacheExpiry.ONE_WEEK,
            );
            return [zeroAddress, 'No proxies created'] as const;
          }

          const masterCopyAddress = proxiesCreated[0].args.masterCopy;
          if (!masterCopyAddress) {
            return [zeroAddress, 'No master copy address'] as const;
          }

          setValue(CacheKeys.MASTER_COPY_PREFIX + proxyAddress, masterCopyAddress);
          return [masterCopyAddress, null] as const;
        })
        .catch(() => {
          return [zeroAddress, 'error'] as const;
        });
    },
    [getValue, publicClient, setValue, zodiacModuleProxyFactory],
  );

  const getZodiacModuleProxyMasterCopyData = useCallback(
    async function (proxyAddress: Address) {
      let masterCopyAddress: Address = zeroAddress;
      let error;

      [masterCopyAddress, error] = await getMasterCopyAddress(proxyAddress);
      if (error) {
        console.error(error);
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
      isERC721FreezeVoting,
      isFractalModule,
      isMultisigFreezeGuard,
      isMultisigFreezeVoting,
      isOzLinearVoting,
      isOzLinearVotingERC721,
    ],
  );

  return { getZodiacModuleProxyMasterCopyData };
}
