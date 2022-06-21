import { useCallback, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import useCreateDAO from './useCreateDAO';
import { useTransaction } from '../contexts/web3Data/transactions';
import { MetaFactory, MetaFactory__factory } from '../assets/typechain-types/metafactory';
import { useAddresses } from '../contexts/daoData/useAddresses';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { TokenAllocation } from '../types/tokenAllocation';

const useDeployDAO = ({
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
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);

  const createDAOData = useCreateDAO({
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

  const [contractCallDeploy, contractCallPending] = useTransaction();

  const [metaFactory, setMetaFactory] = useState<MetaFactory>();
  useEffect(() => {
    if (addresses.metaFactory === undefined || signerOrProvider === null) {
      setMetaFactory(undefined);
      return;
    }

    setMetaFactory(MetaFactory__factory.connect(addresses.metaFactory.address, signerOrProvider));
  }, [addresses.metaFactory, signerOrProvider]);

  let deployDao = useCallback(() => {
    if (metaFactory === undefined) {
      return;
    }

    const daoData = createDAOData();
    if (daoData === undefined) {
      console.error('dao data undefined');
      return;
    }

    contractCallDeploy({
      contractFn: () =>
        metaFactory.createDAOAndModules(
          daoData.daoFactory,
          daoData.metaFactoryTempRoleIndex,
          daoData.createDAOParams,
          daoData.moduleFactoriesCallData,
          daoData.moduleActionData,
          daoData.roleModuleMembers
        ),
      pendingMessage: 'Deploying Fractal...',
      failedMessage: 'Deployment Failed',
      successMessage: 'DAO Created',
      successCallback: receipt => {
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
      },
    });
  }, [addresses.daoFactory, contractCallDeploy, createDAOData, metaFactory, successCallback]);

  return [deployDao, contractCallPending] as const;
};

export default useDeployDAO;
