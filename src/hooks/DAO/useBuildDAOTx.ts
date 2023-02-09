import { useCallback, useMemo } from 'react';
import { useProvider, useSigner, useAccount } from 'wagmi';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/provider/types';
import { TxBuilderFactory } from '../../models/TxBuilderFactory';
import { BaseContracts, UsulContracts } from '../../models/types/contracts';
import { GovernanceTypes } from '../../providers/Fractal/types';
import useSafeContracts from '../safe/useSafeContracts';

const useBuildDAOTx = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  const { address: account } = useAccount();

  const {
    multiSendContract,
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    linearVotingMasterCopyContract,
    fractalUsulMasterCopyContract,
    zodiacModuleProxyFactoryContract,
    fractalRegistryContract,
    fractalModuleMasterCopyContract,
    gnosisVetoGuardMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    vetoERC20VotingMasterCopyContract,
    votesTokenMasterCopyContract,
  } = useSafeContracts();

  const buildDao = useCallback(
    async (
      daoData: TokenGovernanceDAO | GnosisDAO,
      parentDAOAddress?: string,
      parentTokenAddress?: string
    ) => {
      let usulContracts;

      if (
        !account ||
        !signerOrProvider ||
        !multiSendContract ||
        !fractalRegistryContract ||
        !zodiacModuleProxyFactoryContract ||
        !fractalModuleMasterCopyContract ||
        !gnosisVetoGuardMasterCopyContract ||
        !vetoMultisigVotingMasterCopyContract ||
        !vetoERC20VotingMasterCopyContract ||
        !gnosisSafeFactoryContract ||
        !gnosisSafeSingletonContract
      ) {
        return;
      }

      if (daoData.governance === GovernanceTypes.GNOSIS_SAFE_USUL) {
        if (
          !fractalUsulMasterCopyContract ||
          !linearVotingMasterCopyContract ||
          !votesTokenMasterCopyContract ||
          !usulVetoGuardMasterCopyContract
        ) {
          return;
        }

        usulContracts = {
          fractalUsulMasterCopyContract: fractalUsulMasterCopyContract.asSigner,
          linearVotingMasterCopyContract: linearVotingMasterCopyContract.asSigner,
          usulVetoGuardMasterCopyContract: usulVetoGuardMasterCopyContract.asSigner,
          votesTokenMasterCopyContract: votesTokenMasterCopyContract.asSigner,
        } as UsulContracts;
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
        usulContracts,
        daoData,
        parentDAOAddress,
        parentTokenAddress
      );

      await txBuilderFactory.setupGnosisSafeData();
      const daoTxBuilder = txBuilderFactory.createDaoTxBuilder();

      // Build Tx bundle based on governance type (Usul or Multisig)
      const safeTx =
        daoData.governance === GovernanceTypes.GNOSIS_SAFE_USUL
          ? await daoTxBuilder.buildUsulTx()
          : await daoTxBuilder.buildMultisigTx();

      return {
        predictedGnosisSafeAddress: txBuilderFactory.predictedGnosisSafeAddress!,
        createSafeTx: txBuilderFactory.createSafeTx!,
        safeTx,
      };
    },
    [
      account,
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
      fractalUsulMasterCopyContract,
      linearVotingMasterCopyContract,
      votesTokenMasterCopyContract,
      usulVetoGuardMasterCopyContract,
    ]
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
