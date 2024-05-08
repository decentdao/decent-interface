import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
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
import useSignerOrProvider from '../utils/useSignerOrProvider';

const useBuildDAOTx = () => {
  const signerOrProvider = useSignerOrProvider();
  const {
    createOptions,
    contracts: {
      fallbackHandler,
      votesERC20WrapperMasterCopy,
      votesERC20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      safeFactory,
      zodiacModuleProxyFactory,
    },
  } = useNetworkConfig();

  const {
    baseContracts,
    readOnly: { user, dao },
    governance,
    governanceContracts: { erc721LinearVotingContractAddress },
  } = useFractal();
  const publicClient = usePublicClient();

  const buildDao = useCallback(
    async (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO | SafeMultisigDAO,
      parentAddress?: string,
      parentTokenAddress?: string,
    ) => {
      let azoriusContracts: AzoriusContracts | undefined;

      if (!user.address || !signerOrProvider || !baseContracts || !publicClient) {
        return;
      }
      const {
        multiSendContract,
        safeSingletonContract,
        linearVotingMasterCopyContract,
        linearVotingERC721MasterCopyContract,
        fractalAzoriusMasterCopyContract,
        fractalModuleMasterCopyContract,
        multisigFreezeGuardMasterCopyContract,
        azoriusFreezeGuardMasterCopyContract,
        freezeMultisigVotingMasterCopyContract,
        freezeERC20VotingMasterCopyContract,
        freezeERC721VotingMasterCopyContract,
        claimingMasterCopyContract,
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
          !azoriusFreezeGuardMasterCopyContract ||
          !claimingMasterCopyContract
        ) {
          return;
        }

        azoriusContracts = {
          fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.asSigner,
          linearVotingMasterCopyContract: linearVotingMasterCopyContract.asSigner,
          linearVotingERC721MasterCopyContract: linearVotingERC721MasterCopyContract.asSigner,
          azoriusFreezeGuardMasterCopyContract: azoriusFreezeGuardMasterCopyContract.asSigner,
          claimingMasterCopyContract: claimingMasterCopyContract.asSigner,
        };
      }

      const buildrerBaseContracts: BaseContracts = {
        fractalModuleMasterCopyContract: fractalModuleMasterCopyContract.asSigner,
        safeSingletonContract: safeSingletonContract.asSigner,
        multisigFreezeGuardMasterCopyContract: multisigFreezeGuardMasterCopyContract.asSigner,
        multiSendContract: multiSendContract.asSigner,
        freezeERC20VotingMasterCopyContract: freezeERC20VotingMasterCopyContract.asSigner,
        freezeERC721VotingMasterCopyContract: freezeERC721VotingMasterCopyContract.asSigner,
        freezeMultisigVotingMasterCopyContract: freezeMultisigVotingMasterCopyContract.asSigner,
      };

      const txBuilderFactory = new TxBuilderFactory(
        signerOrProvider,
        publicClient,
        buildrerBaseContracts,
        azoriusContracts,
        daoData,
        fallbackHandler,
        votesERC20WrapperMasterCopy,
        votesERC20MasterCopy,
        keyValuePairs,
        fractalRegistry,
        safeFactory,
        zodiacModuleProxyFactory,
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
      signerOrProvider,
      publicClient,
      baseContracts,
      erc721LinearVotingContractAddress,
      dao,
      governance,
      createOptions,
      fallbackHandler,
      votesERC20WrapperMasterCopy,
      votesERC20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      safeFactory,
      zodiacModuleProxyFactory,
    ],
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
