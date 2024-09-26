import { useCallback } from 'react';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  SafeMultisigDAO,
  GovernanceType,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
  AzoriusGovernance,
  VotingStrategyType,
} from '../../types';

const useBuildDAOTx = () => {
  const {
    contracts: {
      compatibilityFallbackHandler,
      votesErc20WrapperMasterCopy,
      votesErc20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      gnosisSafeProxyFactory,
      gnosisSafeL2Singleton,
      zodiacModuleProxyFactory,
      multiSendCallOnly,
      claimErc20MasterCopy,
      moduleFractalMasterCopy,
      linearVotingErc20MasterCopy,
      linearVotingErc721MasterCopy,
      moduleAzoriusMasterCopy,
      freezeGuardAzoriusMasterCopy,
      freezeGuardMultisigMasterCopy,
      freezeVotingErc20MasterCopy,
      freezeVotingErc721MasterCopy,
      freezeVotingMultisigMasterCopy,
    },
  } = useNetworkConfig();

  const {
    readOnly: { user, dao },
    governance,
    governanceContracts: { linearVotingErc721Address },
  } = useFractal();
  const publicClient = usePublicClient();

  const buildDao = useCallback(
    async (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO | SafeMultisigDAO,
      parentAddress?: Address,
      parentTokenAddress?: Address,
    ) => {
      let isAzorius = false;

      if (!user.address || !publicClient) {
        return;
      }

      if (
        daoData.governance === GovernanceType.AZORIUS_ERC20 ||
        daoData.governance === GovernanceType.AZORIUS_ERC721
      ) {
        isAzorius = true;
      }

      const txBuilderFactory = new TxBuilderFactory(
        publicClient,
        isAzorius,
        daoData,
        compatibilityFallbackHandler,
        votesErc20WrapperMasterCopy,
        votesErc20MasterCopy,
        keyValuePairs,
        fractalRegistry,
        gnosisSafeProxyFactory,
        gnosisSafeL2Singleton,
        zodiacModuleProxyFactory,
        freezeGuardAzoriusMasterCopy,
        freezeGuardMultisigMasterCopy,
        freezeVotingErc20MasterCopy,
        freezeVotingErc721MasterCopy,
        freezeVotingMultisigMasterCopy,
        multiSendCallOnly,
        claimErc20MasterCopy,
        moduleFractalMasterCopy,
        linearVotingErc20MasterCopy,
        linearVotingErc721MasterCopy,
        moduleAzoriusMasterCopy,
        parentAddress,
        parentTokenAddress,
      );

      await txBuilderFactory.setupSafeData();
      let parentVotingStrategyType: VotingStrategyType | undefined;
      let parentVotingStrategyAddress: Address | undefined;

      const azoriusGovernance = governance as AzoriusGovernance;
      if (dao && dao.isAzorius && azoriusGovernance.votingStrategy) {
        parentVotingStrategyType = azoriusGovernance.votingStrategy.strategyType;
        if (
          parentVotingStrategyType === VotingStrategyType.LINEAR_ERC721 &&
          linearVotingErc721Address
        ) {
          parentVotingStrategyAddress = linearVotingErc721Address;
        }
      }

      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder(
        parentVotingStrategyType,
        parentVotingStrategyAddress,
      );

      const buildSafeTxParams = {
        shouldSetName: true, // We KNOW this will always be true because the Decent UI doesn't allow creating a safe without a name
        shouldSetSnapshot: daoData.snapshotENS !== '',
      };

      // Build Tx bundle based on governance type (Azorius or Multisig)
      const safeTx = isAzorius
        ? await daoTxBuilder.buildAzoriusTx(buildSafeTxParams)
        : await daoTxBuilder.buildMultisigTx(buildSafeTxParams);

      return {
        predictedSafeAddress: txBuilderFactory.predictedSafeAddress!,
        createSafeTx: txBuilderFactory.createSafeTx!,
        safeTx,
      };
    },
    [
      user.address,
      publicClient,
      compatibilityFallbackHandler,
      votesErc20WrapperMasterCopy,
      votesErc20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      gnosisSafeProxyFactory,
      gnosisSafeL2Singleton,
      zodiacModuleProxyFactory,
      freezeGuardAzoriusMasterCopy,
      freezeGuardMultisigMasterCopy,
      freezeVotingErc20MasterCopy,
      freezeVotingErc721MasterCopy,
      freezeVotingMultisigMasterCopy,
      multiSendCallOnly,
      claimErc20MasterCopy,
      moduleFractalMasterCopy,
      linearVotingErc20MasterCopy,
      linearVotingErc721MasterCopy,
      moduleAzoriusMasterCopy,
      dao,
      governance,
      linearVotingErc721Address,
    ],
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
