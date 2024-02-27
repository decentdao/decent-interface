import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { Contract, constants } from 'ethers';
import { useCallback } from 'react';
import { getEventRPC } from '../../helpers';
import { useFractal } from '../../providers/App/AppProvider';
import { CacheKeys } from './cache/cacheDefaults';
import { useLocalStorage } from './cache/useLocalStorage';

export function useMasterCopy() {
  const { getValue, setValue } = useLocalStorage();
  const {
    baseContracts: {
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      linearVotingERC721MasterCopyContract,
      multisigFreezeGuardMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
      fractalAzoriusMasterCopyContract,
      fractalModuleMasterCopyContract,
    },
  } = useFractal();

  const isOzLinearVoting = useCallback(
    (masterCopyAddress: string | `0x${string}`) =>
      masterCopyAddress === linearVotingMasterCopyContract.asProvider.address,
    [linearVotingMasterCopyContract]
  );
  const isOzLinearVotingERC721 = useCallback(
    (masterCopyAddress: string | `0x${string}`) =>
      masterCopyAddress === linearVotingERC721MasterCopyContract.asProvider.address,
    [linearVotingERC721MasterCopyContract]
  );
  const isMultisigFreezeGuard = useCallback(
    (masterCopyAddress: string | `0x${string}`) =>
      masterCopyAddress === multisigFreezeGuardMasterCopyContract.asProvider.address,
    [multisigFreezeGuardMasterCopyContract]
  );
  const isMultisigFreezeVoting = useCallback(
    (masterCopyAddress: string | `0x${string}`) =>
      masterCopyAddress === freezeMultisigVotingMasterCopyContract.asProvider.address,
    [freezeMultisigVotingMasterCopyContract]
  );
  const isERC721FreezeVoting = useCallback(
    (masterCopyAddress: string | `0x${string}`) =>
      masterCopyAddress === freezeERC721VotingMasterCopyContract.asProvider.address,
    [freezeERC721VotingMasterCopyContract]
  );
  const isAzorius = useCallback(
    (masterCopyAddress: string | `0x${string}`) =>
      masterCopyAddress === fractalAzoriusMasterCopyContract.asProvider.address,
    [fractalAzoriusMasterCopyContract]
  );
  const isFractalModule = useCallback(
    (masterCopyAddress: string | `0x${string}`) =>
      masterCopyAddress === fractalModuleMasterCopyContract.asProvider.address,
    [fractalModuleMasterCopyContract]
  );

  const getMasterCopyAddress = useCallback(
    async function (
      contract: Contract,
      proxyAddress: string | `0x${string}`
    ): Promise<[string, string | null]> {
      const cachedValue = getValue(CacheKeys.MASTER_COPY_PREFIX + proxyAddress);
      if (cachedValue) return [cachedValue, null] as const;

      const filter = contract.filters.ModuleProxyCreation(proxyAddress, null);
      return contract.queryFilter(filter).then(proxiesCreated => {
        if (proxiesCreated.length === 0) {
          return [constants.AddressZero, 'No proxies created'] as const;
        }
        const masterCopyAddress = proxiesCreated[0].args!.masterCopy;
        setValue(CacheKeys.MASTER_COPY_PREFIX + proxyAddress, masterCopyAddress);
        return [masterCopyAddress, null] as const;
      });
    },
    [getValue, setValue]
  );

  const getZodiacModuleProxyMasterCopyData = useCallback(
    async function (proxyAddress: string | `0x${string}`) {
      const contract = getEventRPC<ModuleProxyFactory>(zodiacModuleProxyFactoryContract);
      const [masterCopyAddress, error] = await getMasterCopyAddress(contract, proxyAddress);
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
      zodiacModuleProxyFactoryContract,
      getMasterCopyAddress,
      isAzorius,
      isFractalModule,
      isERC721FreezeVoting,
      isMultisigFreezeGuard,
      isMultisigFreezeVoting,
      isOzLinearVoting,
      isOzLinearVotingERC721,
    ]
  );

  return { getZodiacModuleProxyMasterCopyData };
}
