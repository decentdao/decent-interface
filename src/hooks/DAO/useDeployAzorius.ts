import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAddress, isHex } from 'viem';
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
import useSignerOrProvider from '../utils/useSignerOrProvider';
import useSubmitProposal from './proposal/useSubmitProposal';

const useDeployAzorius = () => {
  const signerOrProvider = useSignerOrProvider();
  const navigate = useNavigate();
  const {
    contracts: { fallbackHandler },
    addressPrefix,
  } = useNetworkConfig();
  const {
    node: { safe },
    baseContracts,
  } = useFractal();

  const { t } = useTranslation(['transaction', 'proposalMetadata']);
  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();

  const daoAddress = safe?.address;

  const deployAzorius = useCallback(
    async (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO,
      shouldSetName?: boolean,
      shouldSetSnapshot?: boolean,
      customNonce?: number,
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
        fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.asProvider,
        linearVotingMasterCopyContract: linearVotingMasterCopyContract.asProvider,
        azoriusFreezeGuardMasterCopyContract: azoriusFreezeGuardMasterCopyContract.asProvider,
        votesTokenMasterCopyContract: votesTokenMasterCopyContract.asProvider,
        claimingMasterCopyContract: claimingMasterCopyContract.asProvider,
        votesERC20WrapperMasterCopyContract: votesERC20WrapperMasterCopyContract.asProvider,
      } as AzoriusContracts;

      const builderBaseContracts = {
        fractalModuleMasterCopyContract: fractalModuleMasterCopyContract.asProvider,
        fractalRegistryContract: fractalRegistryContract.asProvider,
        safeFactoryContract: safeFactoryContract.asProvider,
        safeSingletonContract: safeSingletonContract.asProvider,
        multisigFreezeGuardMasterCopyContract: multisigFreezeGuardMasterCopyContract.asProvider,
        multiSendContract: multiSendContract.asProvider,
        freezeERC20VotingMasterCopyContract: freezeERC20VotingMasterCopyContract.asProvider,
        freezeMultisigVotingMasterCopyContract: freezeMultisigVotingMasterCopyContract.asProvider,
        zodiacModuleProxyFactoryContract: zodiacModuleProxyFactoryContract.asProvider,
        keyValuePairsContract: keyValuePairsContract.asProvider,
      } as BaseContracts;

      const txBuilderFactory = new TxBuilderFactory(
        signerOrProvider,
        builderBaseContracts,
        azoriusContracts,
        daoData,
        fallbackHandler,
        undefined,
        undefined,
      );

      txBuilderFactory.setSafeContract(daoAddress);

      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder();
      const safeTx = await daoTxBuilder.buildAzoriusTx(shouldSetName, shouldSetSnapshot, {
        owners: safe.owners,
      });

      const encodedAddOwnerWithThreshold =
        safeSingletonContract.asProvider.interface.encodeFunctionData('addOwnerWithThreshold', [
          multiSendContract.asProvider.address,
          1,
        ]);
      if (!isHex(encodedAddOwnerWithThreshold)) {
        return;
      }
      const encodedMultisend = multiSendContract.asProvider.interface.encodeFunctionData(
        'multiSend',
        [safeTx],
      );
      if (!isHex(encodedMultisend)) {
        return;
      }
      const proposalData: ProposalExecuteData = {
        targets: [daoAddress, getAddress(multiSendContract.asProvider.address)],
        values: [0n, 0n],
        calldatas: [encodedAddOwnerWithThreshold, encodedMultisend],
        metaData: {
          title: '',
          description: '',
          documentationUrl: '',
        },
      };

      await submitProposal({
        proposalData,
        nonce: customNonce || safe.nonce,
        pendingToastMessage: t('modifyGovernanceSetAzoriusProposalPendingMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
        failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
        successCallback: () => navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress)),
      });
    },
    [
      signerOrProvider,
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
