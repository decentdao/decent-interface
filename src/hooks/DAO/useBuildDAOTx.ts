import { useCallback } from 'react';
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
import useSignerOrProvider from '../utils/useSignerOrProvider';

const useBuildDAOTx = () => {
  const signerOrProvider = useSignerOrProvider();
  const {
    contracts: {
      fallbackHandler,
      votesERC20WrapperMasterCopy,
      votesERC20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      safeFactory,
      safe: safeSingleton,
      zodiacModuleProxyFactory,
      multisend: multiSendCallOnly,
      claimingMasterCopy: erc20ClaimMasterCopy,
      fractalModuleMasterCopy,
      linearVotingMasterCopy: linearERC20VotingMasterCopy,
      linearVotingERC721MasterCopy: linearERC721VotingMasterCopy,
      fractalAzoriusMasterCopy: azoriusMasterCopy,
      azoriusFreezeGuardMasterCopy,
      multisigFreezeGuardMasterCopy,
      erc20FreezeVotingMasterCopy,
      erc721FreezeVotingMasterCopy,
      multisigFreezeVotingMasterCopy,
    },
  } = useNetworkConfig();

  const {
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
      let isAzorius = false;

      if (!user.address || !signerOrProvider || !publicClient) {
        return;
      }

      if (
        daoData.governance === GovernanceType.AZORIUS_ERC20 ||
        daoData.governance === GovernanceType.AZORIUS_ERC721
      ) {
        isAzorius = true;
      }

      const txBuilderFactory = new TxBuilderFactory(
        signerOrProvider,
        publicClient,
        isAzorius,
        daoData,
        fallbackHandler,
        votesERC20WrapperMasterCopy,
        votesERC20MasterCopy,
        keyValuePairs,
        fractalRegistry,
        safeFactory,
        safeSingleton,
        zodiacModuleProxyFactory,
        azoriusFreezeGuardMasterCopy,
        multisigFreezeGuardMasterCopy,
        erc20FreezeVotingMasterCopy,
        erc721FreezeVotingMasterCopy,
        multisigFreezeVotingMasterCopy,
        multiSendCallOnly,
        erc20ClaimMasterCopy,
        fractalModuleMasterCopy,
        linearERC20VotingMasterCopy,
        linearERC721VotingMasterCopy,
        azoriusMasterCopy,
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
      fallbackHandler,
      votesERC20WrapperMasterCopy,
      votesERC20MasterCopy,
      keyValuePairs,
      fractalRegistry,
      safeFactory,
      safeSingleton,
      zodiacModuleProxyFactory,
      azoriusFreezeGuardMasterCopy,
      multisigFreezeGuardMasterCopy,
      erc20FreezeVotingMasterCopy,
      erc721FreezeVotingMasterCopy,
      multisigFreezeVotingMasterCopy,
      multiSendCallOnly,
      erc20ClaimMasterCopy,
      fractalModuleMasterCopy,
      linearERC20VotingMasterCopy,
      linearERC721VotingMasterCopy,
      azoriusMasterCopy,
      dao,
      governance,
      erc721LinearVotingContractAddress,
    ],
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
