import { useCallback, useState, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import { MetaFactory, MetaFactory__factory } from '../assets/typechain-types/metafactory';
import { useAddresses } from '../contexts/daoData/useAddresses';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { MetaFactoryCreateDAOData } from '../types/metaFactory';
import { TokenAllocation } from '../types/tokenAllocation';

const useCreateDAO = ({
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
}) => {
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);

  const [metaFactory, setMetaFactory] = useState<MetaFactory>();
  useEffect(() => {
    if (addresses.metaFactory === undefined || signerOrProvider === null) {
      setMetaFactory(undefined);
      return;
    }

    setMetaFactory(MetaFactory__factory.connect(addresses.metaFactory.address, signerOrProvider));
  }, [addresses.metaFactory, signerOrProvider]);

  const createDAO = useCallback(() => {
    if (metaFactory === undefined) {
      return undefined;
    }

    const abiCoder = new ethers.utils.AbiCoder();

    const createDAOParams = {
      daoImplementation: addresses.dao?.address!,
      daoFactory: addresses.daoFactory?.address!,
      accessControlImplementation: addresses.accessControl?.address!,
      daoName: daoName,
      roles: ['EXECUTE_ROLE', 'UPGRADE_ROLE', 'WITHDRAWER_ROLE', 'GOVERNOR_ROLE'],
      rolesAdmins: ['DAO_ROLE', 'DAO_ROLE', 'DAO_ROLE', 'DAO_ROLE'],
      members: [[], [], [], []],
      daoFunctionDescs: ['execute(address[],uint256[],bytes[])', 'upgradeTo(address)'],
      daoActionRoles: [['EXECUTE_ROLE'], ['UPGRADE_ROLE']],
    };

    const moduleFactoriesCalldata = [
      {
        factory: addresses.treasuryModuleFactory?.address!, // Treasury Factory
        data: [abiCoder.encode(['address'], [addresses.treasuryModule?.address!])],
        value: 0,
        newContractAddressesToPass: [1],
        addressesReturned: 1,
      },
      {
        factory: addresses.tokenFactory?.address!, // Token Factory
        data: [
          abiCoder.encode(['string'], [tokenName]),
          abiCoder.encode(['string'], [tokenSymbol]),
          abiCoder.encode(
            ['address[]'],
            [tokenAllocations.map(tokenAllocation => tokenAllocation.address)]
          ),
          abiCoder.encode(
            ['uint256[]'],
            [
              tokenAllocations.map(tokenAllocation =>
                ethers.utils.parseUnits(tokenAllocation.amount.toString(), 18)
              ),
            ]
          ),
          abiCoder.encode(['uint256'], [ethers.utils.parseUnits(tokenSupply.toString(), 18)]),
        ],
        value: 0,
        newContractAddressesToPass: [2],
        addressesReturned: 1,
      },
      {
        factory: addresses.governorFactory?.address!, // Governor Factory
        data: [
          abiCoder.encode(['address'], [addresses.governorModule?.address]), // Governor Impl
          abiCoder.encode(['address'], [addresses.timelockUpgradeable?.address]), // Timelock Impl
          abiCoder.encode(['uint64'], [BigNumber.from(lateQuorumExecution)]), // vote extension
          abiCoder.encode(['uint256'], [BigNumber.from(voteStartDelay)]), // voteDelay
          abiCoder.encode(['uint256'], [BigNumber.from(votingPeriod)]), // votingPeriod
          abiCoder.encode(
            ['uint256'],
            [BigNumber.from(ethers.utils.parseUnits(proposalThreshold, 18))]
          ), // Threshold
          abiCoder.encode(['uint256'], [BigNumber.from(quorum)]), // Quorum
          abiCoder.encode(['uint256'], [BigNumber.from(executionDelay)]), // Execution Delay_Timelock
        ],
        value: 0,
        newContractAddressesToPass: [0, 1, 3],
        addressesReturned: 2,
      },
    ];

    const moduleActionCalldata = {
      contractIndexes: [2, 2, 2, 2, 2, 2, 4, 5, 5, 5, 5, 5],
      functionDescs: [
        'withdrawEth(address[],uint256[])',
        'depositERC20Tokens(address[],address[],uint256[])',
        'withdrawERC20Tokens(address[],address[],uint256[])',
        'depositERC721Tokens(address[],address[],uint256[])',
        'withdrawERC721Tokens(address[],address[],uint256[])',
        'upgradeTo(address)',
        'upgradeTo(address)',
        'upgradeTo(address)',
        'updateDelay(uint256)',
        'scheduleBatch(address[],uint256[],bytes[],bytes32,bytes32,uint256)',
        'cancel(bytes32)',
        'executeBatch(address[],uint256[],bytes[],bytes32,bytes32)',
      ],
      roles: [
        ['WITHDRAWER_ROLE'],
        ['OPEN_ROLE'],
        ['WITHDRAWER_ROLE'],
        ['OPEN_ROLE'],
        ['WITHDRAWER_ROLE'],
        ['UPGRADE_ROLE'],
        ['UPGRADE_ROLE'],
        ['UPGRADE_ROLE'],
        ['GOVERNOR_ROLE'],
        ['GOVERNOR_ROLE'],
        ['GOVERNOR_ROLE'],
        ['GOVERNOR_ROLE'],
      ],
    };

    const createDAOData: MetaFactoryCreateDAOData = {
      daoFactory: addresses.daoFactory?.address!,
      metaFactoryTempRoleIndex: 0,
      createDAOParams: createDAOParams,
      moduleFactoriesCallData: moduleFactoriesCalldata,
      moduleActionData: moduleActionCalldata,
      roleModuleMembers: [[5], [0], [0], [4]],
    };

    return createDAOData;
  }, [
    addresses.accessControl?.address,
    addresses.dao?.address,
    addresses.daoFactory?.address,
    addresses.governorFactory?.address,
    addresses.governorModule?.address,
    addresses.timelockUpgradeable?.address,
    addresses.tokenFactory?.address,
    addresses.treasuryModule?.address,
    addresses.treasuryModuleFactory?.address,
    daoName,
    executionDelay,
    lateQuorumExecution,
    metaFactory,
    proposalThreshold,
    quorum,
    tokenAllocations,
    tokenName,
    tokenSupply,
    tokenSymbol,
    voteStartDelay,
    votingPeriod,
  ]);

  return createDAO;
};

export default useCreateDAO;
