import { useCallback } from 'react';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  SafeMultisigDAO,
  GovernanceType,
  AzoriusContracts,
  BaseContracts,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
  AzoriusGovernance,
  VotingStrategyType,
} from '../../types';
import useContractClient from '../utils/useContractClient';

const useBuildDAOTx = () => {
  const {
    createOptions,
    contracts: { fallbackHandler },
  } = useNetworkConfig();

  const {
    baseContracts,
    readOnly: { user, dao },
    governance,
    governanceContracts: { erc721LinearVotingContractAddress },
  } = useFractal();
  const { walletOrPublicClient } = useContractClient();

  const buildDao = useCallback(
    async (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO | SafeMultisigDAO,
      parentAddress?: string,
      parentTokenAddress?: string,
    ) => {
      let azoriusContracts;

      if (!user.address || !walletOrPublicClient || !baseContracts) {
        return;
      }
      const {
        multiSendContract,
        safeFactoryContract,
        safeSingletonContract,
        linearVotingMasterCopyContract,
        linearVotingERC721MasterCopyContract,
        fractalAzoriusMasterCopyContract,
        zodiacModuleProxyFactoryContract,
        fractalRegistryContract,
        fractalModuleMasterCopyContract,
        multisigFreezeGuardMasterCopyContract,
        azoriusFreezeGuardMasterCopyContract,
        freezeMultisigVotingMasterCopyContract,
        freezeERC20VotingMasterCopyContract,
        freezeERC721VotingMasterCopyContract,
        votesTokenMasterCopyContract,
        claimingMasterCopyContract,
        votesERC20WrapperMasterCopyContract,
        keyValuePairsContract,
      } = baseContracts;

      if (
        createOptions.includes(GovernanceType.AZORIUS_ERC721) &&
        (!freezeERC721VotingMasterCopyContract || !linearVotingERC721MasterCopyContract)
      ) {
        return;
      }
      if (
        daoData.governance === GovernanceType.AZORIUS_ERC20 ||
        daoData.governance === GovernanceType.AZORIUS_ERC721
      ) {
        if (
          !fractalAzoriusMasterCopyContract ||
          !linearVotingMasterCopyContract ||
          !votesTokenMasterCopyContract ||
          !azoriusFreezeGuardMasterCopyContract ||
          !claimingMasterCopyContract
        ) {
          return;
        }

        azoriusContracts = {
          fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.asWallet,
          linearVotingMasterCopyContract: linearVotingMasterCopyContract.asWallet,
          linearVotingERC721MasterCopyContract: linearVotingERC721MasterCopyContract.asWallet,
          azoriusFreezeGuardMasterCopyContract: azoriusFreezeGuardMasterCopyContract.asWallet,
          votesTokenMasterCopyContract: votesTokenMasterCopyContract.asWallet,
          claimingMasterCopyContract: claimingMasterCopyContract.asWallet,
          votesERC20WrapperMasterCopyContract: votesERC20WrapperMasterCopyContract.asWallet,
        } as AzoriusContracts;
      }

      const buildrerBaseContracts = {
        fractalModuleMasterCopyContract: fractalModuleMasterCopyContract.asWallet,
        fractalRegistryContract: fractalRegistryContract.asWallet,
        safeFactoryContract: safeFactoryContract.asWallet,
        safeSingletonContract: safeSingletonContract.asWallet,
        multisigFreezeGuardMasterCopyContract: multisigFreezeGuardMasterCopyContract.asWallet,
        multiSendContract: multiSendContract.asWallet,
        freezeERC20VotingMasterCopyContract: freezeERC20VotingMasterCopyContract.asWallet,
        freezeERC721VotingMasterCopyContract: freezeERC721VotingMasterCopyContract.asWallet,
        freezeMultisigVotingMasterCopyContract: freezeMultisigVotingMasterCopyContract.asWallet,
        zodiacModuleProxyFactoryContract: zodiacModuleProxyFactoryContract.asWallet,
        keyValuePairsContract: keyValuePairsContract.asWallet,
      } as BaseContracts;

      const txBuilderFactory = new TxBuilderFactory(
        walletOrPublicClient,
        buildrerBaseContracts,
        azoriusContracts,
        daoData,
        fallbackHandler.address,
        parentAddress,
        parentTokenAddress,
      );

      await txBuilderFactory.setupSafeData();
      let parentVotingStrategyType = undefined;
      let parentVotingStrategyAddress = undefined;

      if (dao && dao.isAzorius) {
        const azoriusGovernance = governance as AzoriusGovernance;
        parentVotingStrategyType = azoriusGovernance.votingStrategy.strategyType;
        if (
          parentVotingStrategyType === VotingStrategyType.LINEAR_ERC721 &&
          erc721LinearVotingContractAddress
        ) {
          parentVotingStrategyAddress = erc721LinearVotingContractAddress;
        }
      }

      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder(
        parentVotingStrategyType,
        parentVotingStrategyAddress,
      );

      // Build Tx bundle based on governance type (Azorius or Multisig)
      const safeTx =
        daoData.governance === GovernanceType.AZORIUS_ERC20 ||
        daoData.governance === GovernanceType.AZORIUS_ERC721
          ? await daoTxBuilder.buildAzoriusTx()
          : await daoTxBuilder.buildMultisigTx();

      return {
        predictedSafeAddress: txBuilderFactory.predictedSafeAddress!,
        createSafeTx: txBuilderFactory.createSafeTx!,
        safeTx,
      };
    },
    [
      user.address,
      walletOrPublicClient,
      baseContracts,
      erc721LinearVotingContractAddress,
      dao,
      governance,
      createOptions,
      fallbackHandler,
    ],
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
