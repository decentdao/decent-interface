import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { encodeFunctionData, isHex } from 'viem';
import { usePublicClient } from 'wagmi';
import GnosisSafeL2Abi from '../../assets/abi/GnosisSafeL2';
import MultiSendCallOnlyAbi from '../../assets/abi/MultiSendCallOnly';
import { DAO_ROUTES } from '../../constants/routes';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
import { useCanUserCreateProposal } from '../utils/useCanUserSubmitProposal';
import useSubmitProposal from './proposal/useSubmitProposal';

const useDeployAzorius = () => {
  const navigate = useNavigate();
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
    addressPrefix,
  } = useNetworkConfig();
  const {
    node: { daoAddress, safe },
  } = useFractal();

  const { t } = useTranslation(['transaction', 'proposalMetadata']);
  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const publicClient = usePublicClient();

  const deployAzorius = useCallback(
    async (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO,
      shouldSetName?: boolean,
      shouldSetSnapshot?: boolean,
      customNonce?: number,
    ) => {
      if (!daoAddress || !canUserCreateProposal || !safe || !publicClient) {
        return;
      }

      const txBuilderFactory = new TxBuilderFactory(
        publicClient,
        true,
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
        undefined,
        undefined,
      );

      txBuilderFactory.setSafeContract(daoAddress);

      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder();
      const safeTx = await daoTxBuilder.buildAzoriusTx(shouldSetName, shouldSetSnapshot, {
        owners: safe.owners,
      });

      if (!isHex(safeTx)) {
        throw new Error('Encoded safeTx is not a hex string');
      }

      const encodedAddOwnerWithThreshold = encodeFunctionData({
        abi: GnosisSafeL2Abi,
        functionName: 'addOwnerWithThreshold',
        args: [multiSendCallOnly, 1n],
      });

      const encodedMultisend = encodeFunctionData({
        abi: MultiSendCallOnlyAbi,
        functionName: 'multiSend',
        args: [safeTx],
      });

      const proposalData: ProposalExecuteData = {
        targets: [daoAddress, multiSendCallOnly],
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
      daoAddress,
      canUserCreateProposal,
      safe,
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
      submitProposal,
      t,
      navigate,
      addressPrefix,
    ],
  );

  return deployAzorius;
};

export default useDeployAzorius;
