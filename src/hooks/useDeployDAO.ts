import { useCallback } from 'react';
import { ethers } from 'ethers';
import useCreateDAODataCreator from './useCreateDAODataCreator';
import useCreateGnosisDAODataCreator from './useCreateGnosisDAODataCreator';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useAddresses } from './useAddresses';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { TokenAllocation } from '../types/tokenAllocation';
import { useBlockchainData } from '../contexts/blockchainData';
import { GovernanceTypes, TrustedAddress } from '../components/DaoCreator/provider/types';

const useDeployDAO = () => {
  const {
    state: { chainId, account },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);

  const createDAODataCreator = useCreateDAODataCreator();
  const createGnosisDAODataCreator = useCreateGnosisDAODataCreator();

  const [contractCallDeploy, contractCallPending] = useTransaction();

  const { metaFactoryContract } = useBlockchainData();

  const deployTokenVotingDAO = useCallback(
    (
      {
        daoName,
        tokenName,
        tokenSymbol,
        tokenSupply,
        tokenAllocations,
        proposalThreshold,
        quorum,
        executionDelay,
        lateQuorumExecution,
        voteStartDelay,
        votingPeriod,
      }: {
        daoName: string;
        tokenName: string;
        tokenSymbol: string;
        tokenSupply: string;
        tokenAllocations: TokenAllocation[];
        proposalThreshold: string;
        quorum: string;
        executionDelay: string;
        lateQuorumExecution: string;
        voteStartDelay: string;
        votingPeriod: string;
      },
      successCallback
    ) => {
      if (metaFactoryContract === undefined || account === null) {
        return;
      }

      const createDAOData = createDAODataCreator({
        creator: account,
        daoName,
        tokenName,
        tokenSymbol,
        tokenSupply,
        tokenAllocations,
        proposalThreshold,
        quorum,
        executionDelay,
        lateQuorumExecution,
        voteStartDelay,
        votingPeriod,
      });

      if (createDAOData === undefined) {
        return;
      }

      const deployDAOSuccess = (receipt: ethers.ContractReceipt) => {
        if (!receipt.events) {
          return;
        }

        const event = receipt.events.find(x => {
          if (addresses.daoFactory === undefined) {
            return false;
          }

          return x.address === addresses.daoFactory.address;
        });

        if (event === undefined || event.topics[1] === undefined) {
          return;
        }

        const abiCoder = new ethers.utils.AbiCoder();
        const daoAddress: string = abiCoder.decode(['address'], event.topics[1])[0];
        successCallback(daoAddress);
      };

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
        successCallback: deployDAOSuccess,
      });
    },
    [addresses.daoFactory, contractCallDeploy, createDAODataCreator, metaFactoryContract, account]
  );

  const deployGnosisDAO = useCallback(
    (
      {
        trustedAddresses,
        signatureThreshold,
      }: {
        trustedAddresses: TrustedAddress[];
        signatureThreshold: string;
      },
      successCallback
    ) => {
      if (metaFactoryContract === undefined || account === null) {
        return;
      }

      const createDAOData = createGnosisDAODataCreator({
        creator: account,
        trustedAddresses,
        signatureThreshold,
      });

      if (createDAOData === undefined) {
        return;
      }

      const deployDAOSuccess = (receipt: ethers.ContractReceipt) => {
        if (!receipt.events) {
          return;
        }

        const event = receipt.events.find(x => {
          if (addresses.daoFactory === undefined) {
            return false;
          }

          return x.address === addresses.daoFactory.address;
        });

        if (event === undefined || event.topics[1] === undefined) {
          return;
        }

        const abiCoder = new ethers.utils.AbiCoder();
        const daoAddress: string = abiCoder.decode(['address'], event.topics[1])[0];
        successCallback(daoAddress);
      };

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
        successCallback: deployDAOSuccess,
      });
    },
    [
      addresses.daoFactory,
      contractCallDeploy,
      createGnosisDAODataCreator,
      metaFactoryContract,
      account,
    ]
  );

  const deployDao = useCallback(
    (daoData, type, successCallback) => {
      if (type === GovernanceTypes.TOKEN_VOTING_GOVERNANCE) {
        return deployTokenVotingDAO(daoData, successCallback);
      } else if (typeof daoData === typeof GovernanceTypes.GNOSIS_SAFE) {
        return deployGnosisDAO(daoData, successCallback);
      }
    },
    [deployGnosisDAO, deployTokenVotingDAO]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
