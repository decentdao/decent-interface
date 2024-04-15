import { useMemo } from 'react';
import { getContract } from 'viem';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { NetworkContract } from '../../types/network';
import useContractClient from '../utils/useContractClient';

export default function useSafeContracts() {
  const {
    contracts: {
      safe,
      safeFactory,
      zodiacModuleProxyFactory,
      linearVotingMasterCopy,
      multisend,
      fractalAzoriusMasterCopy,
      fractalModuleMasterCopy,
      fractalRegistry,
      multisigFreezeGuardMasterCopy,
      azoriusFreezeGuardMasterCopy,
      multisigFreezeVotingMasterCopy,
      erc20FreezeVotingMasterCopy,
      erc721FreezeVotingMasterCopy,
      votesERC20MasterCopy,
      claimingMasterCopy,
      votesERC20WrapperMasterCopy,
      linearVotingERC721MasterCopy,
      keyValuePairs,
    },
  } = useNetworkConfig();
  const { walletOrPublicClient, publicClient } = useContractClient();

  const daoContracts = useMemo(() => {
    if (!walletOrPublicClient || !publicClient) {
      return;
    }
    const getContractConnection = (networkContract: NetworkContract) => {
      const baseArgs = { address: networkContract.address, abi: networkContract.abi };
      return {
        asWallet: getContract({ ...baseArgs, client: walletOrPublicClient }),
        asPublic: getContract({ ...baseArgs, client: publicClient }),
      };
    };
    const multiSendContract = getContractConnection(multisend);

    const safeFactoryContract = getContractConnection(safeFactory);

    const fractalAzoriusMasterCopyContract = getContractConnection(fractalAzoriusMasterCopy);

    const linearVotingMasterCopyContract = getContractConnection(linearVotingMasterCopy);
    const linearVotingERC721MasterCopyContract = linearVotingERC721MasterCopy
      ? getContractConnection(linearVotingERC721MasterCopy)
      : undefined;

    const safeSingletonContract = getContractConnection(safe);

    const zodiacModuleProxyFactoryContract = getContractConnection(zodiacModuleProxyFactory);

    const fractalModuleMasterCopyContract = getContractConnection(fractalModuleMasterCopy);

    const fractalRegistryContract = getContractConnection(fractalRegistry);

    const multisigFreezeGuardMasterCopyContract = getContractConnection(
      multisigFreezeGuardMasterCopy,
    );

    const azoriusFreezeGuardMasterCopyContract = getContractConnection(
      azoriusFreezeGuardMasterCopy,
    );

    const freezeMultisigVotingMasterCopyContract = getContractConnection(
      multisigFreezeVotingMasterCopy,
    );

    const freezeERC20VotingMasterCopyContract = getContractConnection(erc20FreezeVotingMasterCopy);

    const freezeERC721VotingMasterCopyContract = erc721FreezeVotingMasterCopy
      ? getContractConnection(erc721FreezeVotingMasterCopy)
      : undefined;

    const votesTokenMasterCopyContract = getContractConnection(votesERC20MasterCopy);

    const claimingMasterCopyContract = getContractConnection(claimingMasterCopy);

    const votesERC20WrapperMasterCopyContract = getContractConnection(votesERC20WrapperMasterCopy);

    const keyValuePairsContract = getContractConnection(keyValuePairs);

    return {
      multiSendContract,
      safeFactoryContract,
      fractalAzoriusMasterCopyContract,
      linearVotingMasterCopyContract,
      safeSingletonContract,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      fractalRegistryContract,
      multisigFreezeGuardMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      freezeERC20VotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
      votesTokenMasterCopyContract,
      claimingMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
      linearVotingERC721MasterCopyContract,
      keyValuePairsContract,
    };
  }, [
    safeFactory,
    safe,
    zodiacModuleProxyFactory,
    linearVotingMasterCopy,
    fractalAzoriusMasterCopy,
    multisend,
    fractalModuleMasterCopy,
    fractalRegistry,
    multisigFreezeGuardMasterCopy,
    azoriusFreezeGuardMasterCopy,
    multisigFreezeVotingMasterCopy,
    erc20FreezeVotingMasterCopy,
    votesERC20MasterCopy,
    claimingMasterCopy,
    votesERC20WrapperMasterCopy,
    linearVotingERC721MasterCopy,
    erc721FreezeVotingMasterCopy,
    keyValuePairs,
    walletOrPublicClient,
    publicClient,
  ]);

  return daoContracts;
}
