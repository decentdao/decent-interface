import { ModuleProxyFactory } from '@fractal-framework/fractal-contracts';
import { Contract, constants } from 'ethers';
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
    },
  } = useFractal();

  const isOzLinearVoting = (masterCopyAddress: string | `0x${string}`) =>
    masterCopyAddress === linearVotingMasterCopyContract.asProvider.address;
  const isOzLinearVotingERC721 = (masterCopyAddress: string | `0x${string}`) =>
    masterCopyAddress === linearVotingERC721MasterCopyContract.asProvider.address;
  const isMultisigFreezeGuard = (masterCopyAddress: string | `0x${string}`) =>
    masterCopyAddress === multisigFreezeGuardMasterCopyContract.asProvider.address;
  const isMultisigFreezeVoting = (masterCopyAddress: string | `0x${string}`) =>
    masterCopyAddress === freezeMultisigVotingMasterCopyContract.asProvider.address;
  const isERC721FreezeVoting = (masterCopyAddress: string | `0x${string}`) =>
    masterCopyAddress === freezeERC721VotingMasterCopyContract.asProvider.address;

  async function getMasterCopyAddress(
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
  }

  async function getZodiacModuleProxyMasterCopyData(proxyAddress: string | `0x${string}`) {
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
    };
  }

  return { getZodiacModuleProxyMasterCopyData };
}
