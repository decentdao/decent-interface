import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, encodeFunctionData } from 'viem';
import { DAO_ROUTES } from '../../constants/routes';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  BaseContracts,
  AzoriusContracts,
  ProposalExecuteData,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
} from '../../types';
import { useCanUserCreateProposal } from '../utils/useCanUserSubmitProposal';
import useContractClient from '../utils/useContractClient';
import useSubmitProposal from './proposal/useSubmitProposal';

const useDeployAzorius = () => {
  const { walletOrPublicClient } = useContractClient();
  const navigate = useNavigate();
  const {
    contracts: { fallbackHandler },
    addressPrefix,
  } = useNetworkConfig();
  const {
    node: { daoAddress, safe },
    baseContracts,
  } = useFractal();

  const { t } = useTranslation(['transaction', 'proposalMetadata']);
  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const deployAzorius = useCallback(
    async (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO,
      shouldSetName?: boolean,
      shouldSetSnapshot?: boolean,
    ) => {
      if (!daoAddress || !canUserCreateProposal || !safe || !baseContracts) {
        return;
      }
      const {
        multiSendContract,
        safeFactoryContract,
        safeSingletonContract,
        linearVotingMasterCopyContract,
        fractalAzoriusMasterCopyContract,
        zodiacModuleProxyFactoryContract,
        fractalRegistryContract,
        fractalModuleMasterCopyContract,
        multisigFreezeGuardMasterCopyContract,
        azoriusFreezeGuardMasterCopyContract,
        freezeMultisigVotingMasterCopyContract,
        freezeERC20VotingMasterCopyContract,
        votesTokenMasterCopyContract,
        claimingMasterCopyContract,
        votesERC20WrapperMasterCopyContract,
        keyValuePairsContract,
      } = baseContracts;
      let azoriusContracts;

      azoriusContracts = {
        fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.asPublic,
        linearVotingMasterCopyContract: linearVotingMasterCopyContract.asPublic,
        azoriusFreezeGuardMasterCopyContract: azoriusFreezeGuardMasterCopyContract.asPublic,
        votesTokenMasterCopyContract: votesTokenMasterCopyContract.asPublic,
        claimingMasterCopyContract: claimingMasterCopyContract.asPublic,
        votesERC20WrapperMasterCopyContract: votesERC20WrapperMasterCopyContract.asPublic,
      } as AzoriusContracts;

      const builderBaseContracts = {
        fractalModuleMasterCopyContract: fractalModuleMasterCopyContract.asPublic,
        fractalRegistryContract: fractalRegistryContract.asPublic,
        safeFactoryContract: safeFactoryContract.asPublic,
        safeSingletonContract: safeSingletonContract.asPublic,
        multisigFreezeGuardMasterCopyContract: multisigFreezeGuardMasterCopyContract.asPublic,
        multiSendContract: multiSendContract.asPublic,
        freezeERC20VotingMasterCopyContract: freezeERC20VotingMasterCopyContract.asPublic,
        freezeMultisigVotingMasterCopyContract: freezeMultisigVotingMasterCopyContract.asPublic,
        zodiacModuleProxyFactoryContract: zodiacModuleProxyFactoryContract.asPublic,
        keyValuePairsContract: keyValuePairsContract.asPublic,
      } as BaseContracts;

      const txBuilderFactory = new TxBuilderFactory(
        walletOrPublicClient,
        builderBaseContracts,
        azoriusContracts,
        daoData,
        fallbackHandler.address,
        undefined,
        undefined,
      );

      txBuilderFactory.setSafeContract(daoAddress as Address);

      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder();
      const safeTx = await daoTxBuilder.buildAzoriusTx(shouldSetName, shouldSetSnapshot, {
        owners: safe.owners,
      });

      const proposalData: ProposalExecuteData = {
        targets: [daoAddress as Address, multiSendContract.asPublic.address],
        values: [0n, 0n],
        calldatas: [
          encodeFunctionData({
            abi: safeSingletonContract.asPublic.abi,
            functionName: 'addOwnerWithThreshold',
            args: [multiSendContract.asPublic.address, 1],
          }),
          encodeFunctionData({
            abi: multiSendContract.asPublic.abi,
            functionName: 'multiSend',
            args: [safeTx],
          }),
        ],
        metaData: {
          title: '',
          description: '',
          documentationUrl: '',
        },
      };

      await submitProposal({
        proposalData,
        nonce: safe.nonce,
        pendingToastMessage: t('modifyGovernanceSetAzoriusProposalPendingMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
        failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
        successCallback: () => navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress)),
      });
    },
    [
      walletOrPublicClient,
      baseContracts,
      t,
      canUserCreateProposal,
      daoAddress,
      submitProposal,
      navigate,
      safe,
      fallbackHandler,
      addressPrefix,
    ],
  );

  return deployAzorius;
};

export default useDeployAzorius;
