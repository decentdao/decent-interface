import {
  TokenGovernanceDAO,
  GnosisDAO,
  GovernanceTypes,
} from './../components/DaoCreator/provider/types/index';
import { useCallback } from 'react';
import useCreateDAODataCreator from './useCreateDAODataCreator';
import useCreateGnosisDAODataCreator from './useCreateGnosisDAODataCreator';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useBlockchainData } from '../contexts/blockchainData';
import { useTranslation } from 'react-i18next';

const useDeployDAO = () => {
  const {
    state: { account },
  } = useWeb3Provider();

  const createDAODataCreator = useCreateDAODataCreator();
  const createGnosisDAODataCreator = useCreateGnosisDAODataCreator();

  const [contractCallDeploy, contractCallPending] = useTransaction();

  const { metaFactoryContract } = useBlockchainData();

  const { t } = useTranslation('transaction');

  const deployTokenVotingDAO = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: (daoAddress: string) => void) => {
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
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: (daoAddress: string) => void) => {
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

  const deployDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: (daoAddress: string) => void) => {
      switch (daoData.governance) {
        case GovernanceTypes.TOKEN_VOTING_GOVERNANCE:
          return deployTokenVotingDAO(daoData, successCallback);
        case GovernanceTypes.GNOSIS_SAFE:
          return deployGnosisDAO(daoData, successCallback);
      }
    },
    [deployGnosisDAO, deployTokenVotingDAO]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
