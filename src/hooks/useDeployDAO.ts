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
  setPending,
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
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
  successCallback: (daoAddress: ethers.utils.Result) => void;
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

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  let deployDao = useCallback(() => {
    if (metaFactory === undefined) {
      return;
    }

    const abiCoder = new ethers.utils.AbiCoder();

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
        const event = receipt.events?.filter(x => {
          return x.address === addresses.daoFactory?.address;
        });
        if (event === undefined || event[0].topics[1] === undefined) {
          // @TODO: what is being returned (to where) here?
          return '';
        } else {
          const daoAddress = abiCoder.decode(['address'], event[0].topics[1]);
          successCallback(daoAddress);
        }
      },
    });
  }, [
    addresses.daoFactory?.address,
    contractCallDeploy,
    createDAOData,
    metaFactory,
    successCallback,
  ]);

  return deployDao;
};

export default useDeployDAO;
