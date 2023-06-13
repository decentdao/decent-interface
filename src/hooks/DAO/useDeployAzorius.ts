import { BigNumber } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { DAO_ROUTES } from '../../constants/routes';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import {
  BaseContracts,
  AzoriusContracts,
  AzoriusGovernanceDAO,
  ProposalExecuteData,
} from '../../types';
import useSubmitProposal from './proposal/useSubmitProposal';

const useDeployAzorius = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const { push } = useRouter();
  const {
    node: { daoAddress, safe },
    baseContracts: {
      multiSendContract,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract,
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
    },
  } = useFractal();

  const { t } = useTranslation(['transaction', 'proposalMetadata']);
  const { submitProposal, canUserCreateProposal } = useSubmitProposal();

  const deployAzorius = useCallback(
    async (daoData: AzoriusGovernanceDAO, shouldSetName?: boolean, shouldSetSnapshot?: boolean) => {
      if (!daoAddress || !canUserCreateProposal || !safe) {
        return;
      }
      let azoriusContracts;

      azoriusContracts = {
        fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.asSigner,
        linearVotingMasterCopyContract: linearVotingMasterCopyContract.asSigner,
        azoriusFreezeGuardMasterCopyContract: azoriusFreezeGuardMasterCopyContract.asSigner,
        votesTokenMasterCopyContract: votesTokenMasterCopyContract.asSigner,
        claimingMasterCopyContract: claimingMasterCopyContract.asSigner,
        votesERC20WrapperMasterCopyContract: votesERC20WrapperMasterCopyContract.asSigner,
      } as AzoriusContracts;

      const baseContracts = {
        fractalModuleMasterCopyContract: fractalModuleMasterCopyContract.asSigner,
        fractalRegistryContract: fractalRegistryContract.asSigner,
        gnosisSafeFactoryContract: gnosisSafeFactoryContract.asSigner,
        gnosisSafeSingletonContract: gnosisSafeSingletonContract.asSigner,
        multisigFreezeGuardMasterCopyContract: multisigFreezeGuardMasterCopyContract.asSigner,
        multiSendContract: multiSendContract.asSigner,
        freezeERC20VotingMasterCopyContract: freezeERC20VotingMasterCopyContract.asSigner,
        freezeMultisigVotingMasterCopyContract: freezeMultisigVotingMasterCopyContract.asSigner,
        zodiacModuleProxyFactoryContract: zodiacModuleProxyFactoryContract.asSigner,
        keyValuePairsContract: keyValuePairsContract.asSigner,
      } as BaseContracts;

      const txBuilderFactory = new TxBuilderFactory(
        signerOrProvider,
        baseContracts,
        azoriusContracts,
        daoData,
        undefined,
        undefined
      );

      txBuilderFactory.setSafeContract(daoAddress);

      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder();
      const safeTx = await daoTxBuilder.buildAzoriusTx(shouldSetName, shouldSetSnapshot, {
        owners: safe.owners,
      });

      const proposalData: ProposalExecuteData = {
        targets: [multiSendContract.asSigner.address],
        values: [BigNumber.from('0')],
        calldatas: [multiSendContract.asSigner.interface.encodeFunctionData('multiSend', [safeTx])],
        title: '',
        description: '',
        documentationUrl: '',
      };

      await submitProposal({
        proposalData,
        nonce: safe.nonce,
        pendingToastMessage: t('modifyGovernanceSetAzoriusProposalPendingMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
        failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
        successCallback: () => push(DAO_ROUTES.proposals.relative(daoAddress)),
        safeAddress: daoAddress,
      });
    },
    [
      signerOrProvider,
      multiSendContract,
      fractalRegistryContract,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      multisigFreezeGuardMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      freezeERC20VotingMasterCopyContract,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract,
      claimingMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
      keyValuePairsContract,
      fractalAzoriusMasterCopyContract,
      linearVotingMasterCopyContract,
      votesTokenMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      t,
      canUserCreateProposal,
      daoAddress,
      submitProposal,
      push,
      safe,
    ]
  );

  return deployAzorius;
};

export default useDeployAzorius;
