import { useCallback, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { useFractal } from '../../providers/App/AppProvider';
import {
  TokenGovernanceDAO,
  GnosisDAO,
  StrategyType,
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
      gnosisVetoGuardMasterCopyContract,
      azoriusVetoGuardMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      votesTokenMasterCopyContract,
      claimingMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
    },
    readOnly: { user },
  } = useFractal();

  const buildDao = useCallback(
    async (
      daoData: TokenGovernanceDAO | GnosisDAO,
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
        !gnosisVetoGuardMasterCopyContract ||
        !vetoMultisigVotingMasterCopyContract ||
        !vetoERC20VotingMasterCopyContract ||
        !gnosisSafeFactoryContract ||
        !gnosisSafeSingletonContract ||
        !claimingMasterCopyContract ||
        !votesERC20WrapperMasterCopyContract
      ) {
        return;
      }

      if (daoData.governance === StrategyType.GNOSIS_SAFE_AZORIUS) {
        if (
          !fractalAzoriusMasterCopyContract ||
          !linearVotingMasterCopyContract ||
          !votesTokenMasterCopyContract ||
          !azoriusVetoGuardMasterCopyContract ||
          !claimingMasterCopyContract
        ) {
          return;
        }

        azoriusContracts = {
          fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.asSigner,
          linearVotingMasterCopyContract: linearVotingMasterCopyContract.asSigner,
          azoriusVetoGuardMasterCopyContract: azoriusVetoGuardMasterCopyContract.asSigner,
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
        gnosisVetoGuardMasterCopyContract: gnosisVetoGuardMasterCopyContract.asSigner,
        multiSendContract: multiSendContract.asSigner,
        vetoERC20VotingMasterCopyContract: vetoERC20VotingMasterCopyContract.asSigner,
        vetoMultisigVotingMasterCopyContract: vetoMultisigVotingMasterCopyContract.asSigner,
        zodiacModuleProxyFactoryContract: zodiacModuleProxyFactoryContract.asSigner,
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
        daoData.governance === StrategyType.GNOSIS_SAFE_AZORIUS
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
      gnosisVetoGuardMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract,
      claimingMasterCopyContract,
      fractalAzoriusMasterCopyContract,
      linearVotingMasterCopyContract,
      votesTokenMasterCopyContract,
      azoriusVetoGuardMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
    ]
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
