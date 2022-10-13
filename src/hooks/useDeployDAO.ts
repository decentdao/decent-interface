import { useCallback } from 'react';
import { ethers } from 'ethers';
import { GnosisSafe__factory } from '../assets/typechain-types/gnosis-safe';
import {
  TokenGovernanceDAO,
  GnosisDAO,
  GovernanceTypes,
} from './../components/DaoCreator/provider/types/index';
import useCreateDAODataCreator from './useCreateDAODataCreator';
import useCreateGnosisDAODataCreator from './useCreateGnosisDAODataCreator';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useBlockchainData } from '../contexts/blockchainData';
import useSafeContracts from './useSafeContracts';
import { useTranslation } from 'react-i18next';

type DeployDAOSuccessCallback = (daoAddress: string) => void;

const useDeployDAO = () => {
  const {
    state: { account, signerOrProvider },
  } = useWeb3Provider();
  const {
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    usulMastercopyContract,
    zodiacModuleProxyFactoryContract,
  } = useSafeContracts();

  const createDAODataCreator = useCreateDAODataCreator();
  const createGnosisDAODataCreator = useCreateGnosisDAODataCreator();

  const [contractCallDeploy, contractCallPending] = useTransaction();

  const { metaFactoryContract } = useBlockchainData();

  const { t } = useTranslation('transaction');

  const deployTokenVotingDAO = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: DeployDAOSuccessCallback) => {
      if (metaFactoryContract === undefined || account === null) {
        return;
      }

      const createDAOData = createDAODataCreator({
        creator: account,
        ...(daoData as TokenGovernanceDAO),
      });

      if (createDAOData === undefined) {
        return;
      }

      contractCallDeploy({
        contractFn: () =>
          metaFactoryContract.createDAOAndExecute(
            createDAOData.calldata.daoFactory,
            createDAOData.calldata.createDAOParams,
            createDAOData.calldata.moduleFactories,
            createDAOData.calldata.moduleFactoriesBytes,
            createDAOData.calldata.targets,
            createDAOData.calldata.values,
            createDAOData.calldata.calldatas
          ),
        pendingMessage: t('pendingDeployDAO'),
        failedMessage: t('failedDeployDAO'),
        successMessage: t('successDeployDAO'),
        successCallback: () => successCallback(createDAOData.predictedDAOAddress),
      });
    },
    [contractCallDeploy, createDAODataCreator, metaFactoryContract, account, t]
  );

  const deployGnosisDAO = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: DeployDAOSuccessCallback) => {
      if (metaFactoryContract === undefined || account === null) {
        return;
      }

      const createDAOData = createGnosisDAODataCreator({
        creator: account,
        ...(daoData as GnosisDAO),
      });

      if (createDAOData === undefined) {
        return;
      }

      contractCallDeploy({
        contractFn: () =>
          metaFactoryContract.createDAOAndExecute(
            createDAOData.calldata.daoFactory,
            createDAOData.calldata.createDAOParams,
            createDAOData.calldata.moduleFactories,
            createDAOData.calldata.moduleFactoriesBytes,
            createDAOData.calldata.targets,
            createDAOData.calldata.values,
            createDAOData.calldata.calldatas
          ),
        pendingMessage: t('pendingDeployDAO'),
        failedMessage: t('failedDeployDAO'),
        successMessage: t('successDeployDAO'),
        successCallback: () => successCallback(createDAOData.predictedDAOAddress),
      });
    },
    [contractCallDeploy, createGnosisDAODataCreator, metaFactoryContract, account, t]
  );

  const deployGnosisSafe = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: DeployDAOSuccessCallback) => {
      const deploy = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract?.address ||
          !usulMastercopyContract ||
          !zodiacModuleProxyFactoryContract ||
          !signerOrProvider
        ) {
          return;
        }
        const { AddressZero, HashZero } = ethers.constants;
        const gnosisDaoData = daoData as GnosisDAO;

        const createdSafeProxyAddress = await gnosisSafeFactoryContract.callStatic.createProxy(
          gnosisSafeSingletonContract.address,
          '0x'
        );
        const safeContract = GnosisSafe__factory.connect(createdSafeProxyAddress, signerOrProvider);
        const encodedSetupSafeData = safeContract.interface.encodeFunctionData('setup', [
          gnosisDaoData.trustedAddresses.map(trustedAddress => trustedAddress.address),
          gnosisDaoData.signatureThreshold,
          AddressZero,
          HashZero,
          AddressZero,
          AddressZero,
          0,
          AddressZero,
        ]);
        const VOTING_STRATEGIES_TO_DEPLOY: string[] = []; // @todo pass expected addresses for voting strategies
        const encodedInitUsulData = ethers.utils.defaultAbiCoder.encode(
          ['address', 'address', 'address', 'address[]'],
          [
            createdSafeProxyAddress,
            createdSafeProxyAddress,
            createdSafeProxyAddress,
            VOTING_STRATEGIES_TO_DEPLOY,
          ]
        );
        const encodedSetupUsulData = usulMastercopyContract.interface.encodeFunctionData('setUp', [
          encodedInitUsulData,
        ]);

        contractCallDeploy({
          contractFn: () =>
            gnosisSafeFactoryContract
              .createProxy(gnosisSafeSingletonContract.address, encodedSetupSafeData)
              .then(() =>
                zodiacModuleProxyFactoryContract.deployModule(
                  usulMastercopyContract.address,
                  encodedSetupUsulData,
                  '0x01'
                )
              ),
          pendingMessage: t('pendingDeployGnosis'),
          failedMessage: t('failedDeployGnosis'),
          successMessage: t('successDeployGnosis'),
          successCallback: () => successCallback(createdSafeProxyAddress),
        });
      };

      deploy();
    },
    [
      contractCallDeploy,
      usulMastercopyContract,
      zodiacModuleProxyFactoryContract,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract,
      account,
      signerOrProvider,
      t,
    ]
  );

  const deployDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: DeployDAOSuccessCallback) => {
      switch (daoData.governance) {
        case GovernanceTypes.TOKEN_VOTING_GOVERNANCE:
          return deployTokenVotingDAO(daoData, successCallback);
        case GovernanceTypes.MVD_GNOSIS:
          return deployGnosisDAO(daoData, successCallback);
        case GovernanceTypes.GNOSIS_SAFE:
          return deployGnosisSafe(daoData, successCallback);
      }
    },
    [deployGnosisDAO, deployGnosisSafe, deployTokenVotingDAO]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
