import { useCallback } from 'react';
import { ethers } from 'ethers';
import { GnosisSafeL2__factory } from '../assets/typechain-types/gnosis-safe';
import {
  TokenGovernanceDAO,
  GnosisDAO,
  GovernanceTypes,
} from './../components/DaoCreator/provider/types/index';
import { useAddresses } from './useAddresses';
import useCreateDAODataCreator from './useCreateDAODataCreator';
import useCreateGnosisDAODataCreator from './useCreateGnosisDAODataCreator';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useBlockchainData } from '../contexts/blockchainData';
import useSafeContracts from './useSafeContracts';

type DeployDAOSuccessCallback = (daoAddress: string) => void;

const useDeployDAO = () => {
  const {
    state: { account, chainId, signerOrProvider },
  } = useWeb3Provider();
  const { gnosisSafe } = useAddresses(chainId);
  const { gnosisSafeFactoryContract } = useSafeContracts();

  const createDAODataCreator = useCreateDAODataCreator();
  const createGnosisDAODataCreator = useCreateGnosisDAODataCreator();

  const [contractCallDeploy, contractCallPending] = useTransaction();

  const { metaFactoryContract } = useBlockchainData();

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
        pendingMessage: 'Deploying Fractal...',
        failedMessage: 'Deployment Failed',
        successMessage: 'DAO Created',
        successCallback: () => successCallback(createDAOData.predictedDAOAddress),
      });
    },
    [contractCallDeploy, createDAODataCreator, metaFactoryContract, account]
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
        pendingMessage: 'Deploying Fractal...',
        failedMessage: 'Deployment Failed',
        successMessage: 'DAO Created',
        successCallback: () => successCallback(createDAOData.predictedDAOAddress),
      });
    },
    [contractCallDeploy, createGnosisDAODataCreator, metaFactoryContract, account]
  );

  const deployGnosisSafe = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, successCallback: DeployDAOSuccessCallback) => {
      const deploy = async () => {
        if (!account || !gnosisSafeFactoryContract || !gnosisSafe?.address || !signerOrProvider) {
          return;
        }
        const { AddressZero, HashZero } = ethers.constants;
        const gnosisDaoData = daoData as GnosisDAO;

        const createdSafeProxyAddress = await gnosisSafeFactoryContract.callStatic.createProxy(
          gnosisSafe.address,
          '0x'
        );
        const safeContract = GnosisSafeL2__factory.connect(
          createdSafeProxyAddress,
          signerOrProvider
        );
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

        contractCallDeploy({
          contractFn: () =>
            gnosisSafeFactoryContract.createProxy(gnosisSafe.address, encodedSetupSafeData),
          pendingMessage: 'Deploying Gnosis Safe...',
          failedMessage: 'Deployment Failed',
          successMessage: 'Gnosis Safe Created',
          successCallback: () => successCallback(createdSafeProxyAddress),
        });
      };

      deploy();
    },
    [contractCallDeploy, gnosisSafeFactoryContract, gnosisSafe, account, signerOrProvider]
  );

  const deployDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: DeployDAOSuccessCallback) => {
      switch (daoData.governance) {
        case GovernanceTypes.TOKEN_VOTING_GOVERNANCE:
          return deployTokenVotingDAO(daoData, successCallback);
        case GovernanceTypes.GNOSIS_SAFE:
          return deployGnosisDAO(daoData, successCallback);
        case GovernanceTypes.PURE_GNOSIS_SAFE:
          return deployGnosisSafe(daoData, successCallback);
      }
    },
    [deployGnosisDAO, deployGnosisSafe, deployTokenVotingDAO]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
