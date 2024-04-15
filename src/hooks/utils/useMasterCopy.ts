import { useCallback } from 'react';
import { Address, zeroAddress } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { CacheExpiry, CacheKeys } from './cache/cacheDefaults';
import { useLocalStorage } from './cache/useLocalStorage';

export function useMasterCopy() {
  const { getValue, setValue } = useLocalStorage();
  const { baseContracts } = useFractal();

  const isOzLinearVoting = useCallback(
    (masterCopyAddress?: Address) =>
      masterCopyAddress === baseContracts?.linearVotingMasterCopyContract.asPublic.address,
    [baseContracts],
  );
  const isOzLinearVotingERC721 = useCallback(
    (masterCopyAddress?: Address) =>
      masterCopyAddress === baseContracts?.linearVotingERC721MasterCopyContract.asPublic.address,
    [baseContracts],
  );
  const isMultisigFreezeGuard = useCallback(
    (masterCopyAddress?: Address) =>
      masterCopyAddress === baseContracts?.multisigFreezeGuardMasterCopyContract.asPublic.address,
    [baseContracts],
  );
  const isMultisigFreezeVoting = useCallback(
    (masterCopyAddress?: Address) =>
      masterCopyAddress === baseContracts?.freezeMultisigVotingMasterCopyContract.asPublic.address,
    [baseContracts],
  );
  const isERC721FreezeVoting = useCallback(
    (masterCopyAddress?: Address) =>
      masterCopyAddress === baseContracts?.freezeERC721VotingMasterCopyContract.asPublic.address,
    [baseContracts],
  );
  const isAzorius = useCallback(
    (masterCopyAddress?: Address) =>
      masterCopyAddress === baseContracts?.fractalAzoriusMasterCopyContract.asPublic.address,
    [baseContracts],
  );
  const isFractalModule = useCallback(
    (masterCopyAddress?: Address) =>
      masterCopyAddress === baseContracts?.fractalModuleMasterCopyContract.asPublic.address,
    [baseContracts],
  );

  const getZodiacModuleProxyMasterCopyData = useCallback(
    async function (proxyAddress: Address) {
      let masterCopyAddress: Address | undefined;
      if (baseContracts) {
        const cachedValue = getValue(CacheKeys.MASTER_COPY_PREFIX + proxyAddress);
        if (cachedValue) {
          masterCopyAddress = cachedValue as Address;
        } else {
          masterCopyAddress =
            await baseContracts.zodiacModuleProxyFactoryContract.asPublic.getEvents
              .ModuleProxyCreation([proxyAddress, null])
              .then(proxiesCreated => {
                // @dev to prevent redundant queries, cache the master copy address as AddressZero if no proxies were created
                if (proxiesCreated.length === 0) {
                  setValue(
                    CacheKeys.MASTER_COPY_PREFIX + proxyAddress,
                    zeroAddress,
                    CacheExpiry.ONE_WEEK,
                  );
                  console.error('No proxies created for Zodiac Module Proxy', proxyAddress);
                  return zeroAddress;
                }
                const masterCopy = proxiesCreated[0].topics[0];
                setValue(CacheKeys.MASTER_COPY_PREFIX + proxyAddress, masterCopy);
                return masterCopy;
              });
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
      isAzorius,
      isFractalModule,
      isERC721FreezeVoting,
      isMultisigFreezeGuard,
      isMultisigFreezeVoting,
      isOzLinearVoting,
      isOzLinearVotingERC721,
      baseContracts,
      getValue,
      setValue,
    ],
  );

  return { getZodiacModuleProxyMasterCopyData };
}
