import { useCallback } from 'react';
import { ethers } from 'ethers';
import useCreateDAODataCreator from './useCreateDAODataCreator';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useAddresses } from '../contexts/daoData/useAddresses';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { TokenAllocation } from '../types/tokenAllocation';
import { useBlockchainData } from '../contexts/blockchainData';

const useDeployDAO = () => {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);

  const createDAODataCreator = useCreateDAODataCreator();

  const [contractCallDeploy, contractCallPending] = useTransaction();

  const { metaFactoryContract } = useBlockchainData();

  const deployDao = useCallback(
    ({
      daoName,
      tokenName,
      tokenSymbol,
      tokenAllocations,
      proposalThreshold,
      quorum,
      executionDelay,
      lateQuorumExecution,
      voteStartDelay,
      votingPeriod,
      successCallback,
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
      successCallback: (daoAddress: string) => void;
    }) => {
      if (metaFactoryContract === undefined) {
        return;
      }

      const createDAOData = createDAODataCreator({
        daoName,
        tokenName,
        tokenSymbol,
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
            createDAOData.daoFactory,
            createDAOData.createDAOParams,
            createDAOData.targets,
            createDAOData.values,
            createDAOData.calldatas
          ),
        pendingMessage: 'Deploying Fractal...',
        failedMessage: 'Deployment Failed',
        successMessage: 'DAO Created',
        successCallback: deployDAOSuccess,
      });
    },
    [addresses.daoFactory, contractCallDeploy, createDAODataCreator, metaFactoryContract]
  );

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
