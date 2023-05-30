import { useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import {
  AzoriusGovernanceDAO,
  SafeMultisigDAO,
  GovernanceModuleType,
  AzoriusContracts,
  BaseContracts,
} from '../../types';

const useBuildDAOTx = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  const {
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
    readOnly: { user },
  } = useFractal();

  const buildDao = useCallback(
    async (
      daoData: AzoriusGovernanceDAO | SafeMultisigDAO,
      parentAddress?: string,
      parentTokenAddress?: string
    ) => {
      let azoriusContracts;

      if (
        !user.address ||
        !signerOrProvider ||
        !multiSendContract ||
        !fractalRegistryContract ||
        !zodiacModuleProxyFactoryContract ||
        !fractalModuleMasterCopyContract ||
        !multisigFreezeGuardMasterCopyContract ||
        !freezeMultisigVotingMasterCopyContract ||
        !freezeERC20VotingMasterCopyContract ||
        !gnosisSafeFactoryContract ||
        !gnosisSafeSingletonContract ||
        !claimingMasterCopyContract ||
        !votesERC20WrapperMasterCopyContract ||
        !keyValuePairsContract
      ) {
        return;
      }

      if (daoData.governance === GovernanceModuleType.AZORIUS) {
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
          fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.asSigner,
          linearVotingMasterCopyContract: linearVotingMasterCopyContract.asSigner,
          azoriusFreezeGuardMasterCopyContract: azoriusFreezeGuardMasterCopyContract.asSigner,
          votesTokenMasterCopyContract: votesTokenMasterCopyContract.asSigner,
          claimingMasterCopyContract: claimingMasterCopyContract.asSigner,
          votesERC20WrapperMasterCopyContract: votesERC20WrapperMasterCopyContract.asSigner,
        } as AzoriusContracts;
      }

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
        parentAddress,
        parentTokenAddress
      );

      await txBuilderFactory.setupGnosisSafeData();
      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder();

      // Build Tx bundle based on governance type (Azorius or Multisig)
      const safeTx =
        daoData.governance === GovernanceModuleType.AZORIUS
          ? await daoTxBuilder.buildAzoriusTx()
          : await daoTxBuilder.buildMultisigTx();

      return {
        predictedGnosisSafeAddress: txBuilderFactory.predictedGnosisSafeAddress!,
        createSafeTx: txBuilderFactory.createSafeTx!,
        safeTx,
      };
    },
    [
      user.address,
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
    ]
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
