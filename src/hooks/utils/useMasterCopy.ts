import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { Address, getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
// import { CacheExpiry, CacheKeys } from './cache/cacheDefaults';
// import { getValue, setValue } from './cache/useLocalStorage';

export function useMasterCopy() {
  const {
    // chain,
    contracts: {
      zodiacModuleProxyFactory,
      zodiacModuleProxyFactoryOld,
      linearVotingErc20MasterCopy,
      linearVotingErc721MasterCopy,
      moduleFractalMasterCopy,
      moduleAzoriusMasterCopy,
      freezeGuardMultisigMasterCopy,
      freezeVotingErc721MasterCopy,
      freezeVotingMultisigMasterCopy,
    },
  } = useNetworkConfig();
  const publicClient = usePublicClient();

  const isLinearVotingErc20 = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === linearVotingErc20MasterCopy,
    [linearVotingErc20MasterCopy],
  );
  const isLinearVotingErc721 = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === linearVotingErc721MasterCopy,
    [linearVotingErc721MasterCopy],
  );
  const isFreezeGuardMultisig = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === freezeGuardMultisigMasterCopy,
    [freezeGuardMultisigMasterCopy],
  );
  const isFreezeVotingMultisig = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === freezeVotingMultisigMasterCopy,
    [freezeVotingMultisigMasterCopy],
  );
  const isFreezeVotingErc721 = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === freezeVotingErc721MasterCopy,
    [freezeVotingErc721MasterCopy],
  );
  const isModuleAzorius = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === moduleAzoriusMasterCopy,
    [moduleAzoriusMasterCopy],
  );
  const isModuleFractal = useCallback(
    (masterCopyAddress: Address) => masterCopyAddress === moduleFractalMasterCopy,
    [moduleFractalMasterCopy],
  );

  const getMasterCopyAddress = useCallback(
    async function (
      proxyAddress: Address,
      moduleProxyFactoryContractAddress: Address,
    ): Promise<readonly [Address, string | null]> {
      if (!publicClient) {
        return [zeroAddress, null] as const;
      }

      // const cachedValue = getValue({
      //   cacheName: CacheKeys.MASTER_COPY,
      //   chainId: chain.id,
      //   proxyAddress,
      // });
      // if (cachedValue) return [cachedValue, null] as const;

      const moduleProxyFactoryContract = getContract({
        abi: abis.ModuleProxyFactory,
        address: moduleProxyFactoryContractAddress,
        client: publicClient,
      });

      return moduleProxyFactoryContract.getEvents
        .ModuleProxyCreation({ proxy: proxyAddress }, { fromBlock: 0n })
        .then(proxiesCreated => {
          // @dev to prevent redundant queries, cache the master copy address as AddressZero if no proxies were created
          if (proxiesCreated.length === 0) {
            // setValue(
            //   {
            //     cacheName: CacheKeys.MASTER_COPY,
            //     chainId: chain.id,
            //     proxyAddress,
            //   },
            //   zeroAddress,
            //   CacheExpiry.ONE_WEEK,
            // );
            return [zeroAddress, 'No proxies created'] as const;
          }

          const masterCopyAddress = proxiesCreated[0].args.masterCopy;
          if (!masterCopyAddress) {
            return [zeroAddress, 'No master copy address'] as const;
          }

          // setValue(
          //   {
          //     cacheName: CacheKeys.MASTER_COPY,
          //     chainId: chain.id,
          //     proxyAddress,
          //   },
          //   masterCopyAddress,
          // );
          return [masterCopyAddress, null] as const;
        })
        .catch(() => {
          return [zeroAddress, 'error'] as const;
        });
    },
    [publicClient],
  );

  const getZodiacModuleProxyMasterCopyData = useCallback(
    async function (proxyAddress: Address) {
      let masterCopyAddress: Address = zeroAddress;
      let error: string | null = null;
      [masterCopyAddress, error] = await getMasterCopyAddress(
        proxyAddress,
        zodiacModuleProxyFactory,
      );
      // @dev checks Zodiac's ModuleProxyFactory Contract if the first one fails.
      if (error) {
        [masterCopyAddress, error] = await getMasterCopyAddress(
          proxyAddress,
          zodiacModuleProxyFactoryOld,
        );
      }
      if (error) {
        console.error(error);
      }

      return {
        address: masterCopyAddress,
        isLinearVotingErc20: isLinearVotingErc20(masterCopyAddress),
        isLinearVotingErc721: isLinearVotingErc721(masterCopyAddress),
        isFreezeGuardMultisig: isFreezeGuardMultisig(masterCopyAddress),
        isFreezeVotingMultisig: isFreezeVotingMultisig(masterCopyAddress),
        isFreezeVotingErc721: isFreezeVotingErc721(masterCopyAddress),
        isModuleAzorius: isModuleAzorius(masterCopyAddress),
        isModuleFractal: isModuleFractal(masterCopyAddress),
      };
    },
    [
      getMasterCopyAddress,
      isFreezeGuardMultisig,
      isFreezeVotingErc721,
      isFreezeVotingMultisig,
      isLinearVotingErc20,
      isLinearVotingErc721,
      isModuleAzorius,
      isModuleFractal,
      zodiacModuleProxyFactory,
      zodiacModuleProxyFactoryOld,
    ],
  );

  return { getZodiacModuleProxyMasterCopyData };
}
