import { useCallback } from 'react';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { useAddresses } from './useAddresses';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { MetaFactoryCreateDAOData } from '../types/metaFactory';
import { TokenAllocation } from '../types/tokenAllocation';
import {
  ERC1967Proxy__factory,
  DAO__factory,
  DAOAccessControl__factory,
} from '@fractal-framework/core-contracts';
import { ERC1967Proxy__factory as GovernorERC1967Proxy__factory } from '../assets/typechain-types/module-governor';
import {
  ERC1967Proxy__factory as VotesTokenERC1967Proxy__factory,
  ClaimSubsidiary__factory,
  VotesToken__factory,
} from '../assets/typechain-types/votes-token';
import {
  TreasuryModule__factory,
  ERC1967Proxy__factory as TreasuryERC1967Proxy__factory,
} from '../assets/typechain-types/module-treasury';

import { getRandomBytes } from '../helpers';
import { CreateDAOData } from '../types/create';

const useCreateDAODataCreator = () => {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);

  const createDAOData = useCallback<CreateDAOData>(
    (
      {
        creator,
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
        parentAllocationAmount = BigNumber.from(0),
      },
      parentToken
    ) => {
      const abiCoder = new ethers.utils.AbiCoder();

      if (
        addresses.dao === undefined ||
        addresses.daoFactory === undefined ||
        addresses.accessControl === undefined ||
        addresses.treasuryModuleFactory === undefined ||
        addresses.treasuryModule === undefined ||
        addresses.tokenFactory === undefined ||
        addresses.governorFactory === undefined ||
        addresses.governorModule === undefined ||
        addresses.timelock === undefined ||
        addresses.metaFactory === undefined ||
        addresses.claimFactory === undefined ||
        addresses.claimModule === undefined
      ) {
        return undefined;
      }

      const daoAndAccessControlNonce = getRandomBytes();
      const treasuryNonce = getRandomBytes();
      const votingTokenNonce = getRandomBytes();
      const governorAndTimelockNonce = getRandomBytes();
      const claimSubsidiaryNonce = getRandomBytes();

      const tokenAllocationData = [...tokenAllocations];

      // DAO AND ACCESS CONTROL

      const daoAndAccessControlSalt = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'bytes32'],
        [creator, addresses.metaFactory.address, chainId, daoAndAccessControlNonce]
      );

      const daoInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          ERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.dao.address, []]),
        ]
      );

      const predictedDAOAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        daoAndAccessControlSalt,
        daoInitCode
      );

      const accessControlInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          // eslint-disable-next-line camelcase
          ERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.accessControl.address, []]),
        ]
      );
      const predictedAccessControlAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        daoAndAccessControlSalt,
        accessControlInitCode
      );

      // TREASURY

      const treasurySalt = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'bytes32'],
        [creator, addresses.metaFactory.address, chainId, treasuryNonce]
      );
      const treasuryInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          // eslint-disable-next-line camelcase
          TreasuryERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.treasuryModule.address, []]),
        ]
      );
      const predictedTreasuryAddress = ethers.utils.getCreate2Address(
        addresses.treasuryModuleFactory.address,
        treasurySalt,
        treasuryInitCode
      );

      // If parentAllocationAmount is greater than zero,
      // Then mint the allocation to the Metafactory, to be be transferred
      // to the claim Subsidiary
      if (parentAllocationAmount.gt(0)) {
        const parentTokenAllocation: TokenAllocation = {
          address: addresses.metaFactory.address,
          amount: { value: '', valueBN: parentAllocationAmount },
        };
        tokenAllocationData.push(parentTokenAllocation);
      }

      // If the total token supply is greater than the sum of allocations,
      // Then mint the token difference into the Metafactory, to be deposited
      // into the treasury
      const tokenAllocationSum: BigNumber = tokenAllocationData.reduce(
        (accumulator, tokenAllocation) => {
          return tokenAllocation.amount.valueBN!.add(accumulator);
        },
        BigNumber.from(0)
      );

      if (tokenSupply.bigNumberValue!.gt(tokenAllocationSum)) {
        const daoTokenAllocation: TokenAllocation = {
          address: addresses.metaFactory.address,
          amount: { value: '', valueBN: tokenSupply.bigNumberValue!.sub(tokenAllocationSum) },
        };
        tokenAllocationData.push(daoTokenAllocation);
      }

      const votingTokenSalt = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'bytes32'],
        [creator, addresses.metaFactory.address, chainId, votingTokenNonce]
      );
      const votingTokenInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          // eslint-disable-next-line camelcase
          VotesToken__factory.bytecode,
          abiCoder.encode(
            ['string', 'string', 'address[]', 'uint256[]'],
            [
              tokenName,
              tokenSymbol,
              tokenAllocationData.map(tokenAllocation => tokenAllocation.address),
              tokenAllocationData.map(tokenAllocation => tokenAllocation.amount.valueBN),
            ]
          ),
        ]
      );

      const predictedVotingTokenAddress = ethers.utils.getCreate2Address(
        addresses.tokenFactory.address,
        votingTokenSalt,
        votingTokenInitCode
      );

      const governorAndTimeLockSalt = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'bytes32'],
        [creator, addresses.metaFactory.address, chainId, governorAndTimelockNonce]
      );
      const governorInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          // eslint-disable-next-line camelcase
          GovernorERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.governorModule.address, []]),
        ]
      );

      const predictedGovernorAddress = ethers.utils.getCreate2Address(
        addresses.governorFactory.address,
        governorAndTimeLockSalt,
        governorInitCode
      );

      const predictedTimelockInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          // eslint-disable-next-line camelcase
          GovernorERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.timelock.address, []]),
        ]
      );

      const predictedTimelockAddress = ethers.utils.getCreate2Address(
        addresses.governorFactory.address,
        governorAndTimeLockSalt,
        predictedTimelockInitCode
      );

      let predictedClaimAddress;
      if (parentAllocationAmount.gt(0)) {
        const claimSalt = ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, claimSubsidiaryNonce]
        );
        const claimInitCode = ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            VotesTokenERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.claimModule.address, []]),
          ]
        );
        predictedClaimAddress = ethers.utils.getCreate2Address(
          addresses.claimFactory.address,
          claimSalt,
          claimInitCode
        );
      }

      const createDAOParams = {
        daoImplementation: addresses.dao.address,
        accessControlImplementation: addresses.accessControl.address,
        daoName: daoName,
        salt: daoAndAccessControlNonce,
        roles: ['EXECUTE_ROLE', 'UPGRADE_ROLE', 'WITHDRAWER_ROLE', 'GOVERNOR_ROLE'],
        rolesAdmins: ['DAO_ROLE', 'DAO_ROLE', 'DAO_ROLE', 'DAO_ROLE'],
        members: [
          [predictedTimelockAddress, addresses.metaFactory.address],
          [predictedDAOAddress],
          [predictedDAOAddress],
          [predictedGovernorAddress],
        ],
        daoFunctionDescs: ['execute(address[],uint256[],bytes[])', 'upgradeTo(address)'],
        daoActionRoles: [['EXECUTE_ROLE'], ['UPGRADE_ROLE']],
      };

      const treasuryFactoryCalldata = [
        abiCoder.encode(['address'], [predictedAccessControlAddress]),
        abiCoder.encode(['address'], [addresses.treasuryModule.address]),
        abiCoder.encode(['bytes32'], [treasuryNonce]),
      ];

      const tokenFactoryCalldata = [
        abiCoder.encode(['string'], [tokenName]),
        abiCoder.encode(['string'], [tokenSymbol]),
        abiCoder.encode(
          ['address[]'],
          [tokenAllocationData.map(tokenAllocation => tokenAllocation.address)]
        ),
        abiCoder.encode(
          ['uint256[]'],
          [tokenAllocationData.map(tokenAllocation => tokenAllocation.amount.valueBN)]
        ),
        abiCoder.encode(['bytes32'], [votingTokenNonce]),
      ];

      const governorFactoryCalldata = [
        abiCoder.encode(['address'], [predictedDAOAddress]), // Address of DAO to be deployed
        abiCoder.encode(['address'], [predictedAccessControlAddress]), // Address of Access Control to be deployed
        abiCoder.encode(['address'], [predictedVotingTokenAddress]), // Address of token to be deployed
        abiCoder.encode(['address'], [addresses.governorModule.address]), // Address of Governance module implementation contract
        abiCoder.encode(['address'], [addresses.timelock.address]), // Address of Timelock module implementation contract
        abiCoder.encode(['uint64'], [lateQuorumExecution]), // Vote extension
        abiCoder.encode(['uint256'], [voteStartDelay]), // Vote delay
        abiCoder.encode(['uint256'], [votingPeriod]), // Vote period
        abiCoder.encode(['uint256'], [proposalThreshold]), // Threshold
        abiCoder.encode(['uint256'], [quorum]), // Quorum
        abiCoder.encode(['uint256'], [executionDelay]), // Execution delay
        abiCoder.encode(['bytes32'], [governorAndTimelockNonce]), // Create2 salt
      ];

      let claimFactoryCalldata;
      if (parentAllocationAmount.gt(0)) {
        claimFactoryCalldata = [
          abiCoder.encode(['address'], [addresses.claimModule.address]),
          abiCoder.encode(['bytes32'], [claimSubsidiaryNonce]),
        ];
      }

      const targetsData = [
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedGovernorAddress,
        predictedTimelockAddress,
        predictedTimelockAddress,
        predictedTimelockAddress,
        predictedTimelockAddress,
        predictedTimelockAddress,
      ];
      const sigData = [
        'withdrawEth(address[],uint256[])',
        'withdrawERC20Tokens(address[],address[],uint256[])',
        'withdrawERC721Tokens(address[],address[],uint256[])',
        'depositERC20Tokens(address[],address[],uint256[])',
        'depositERC721Tokens(address[],address[],uint256[])',
        'upgradeTo(address)',
        'upgradeTo(address)',
        'upgradeTo(address)',
        'updateDelay(uint256)',
        'scheduleBatch(address[],uint256[],bytes[],bytes32,bytes32,uint256)',
        'cancel(bytes32)',
        'executeBatch(address[],uint256[],bytes[],bytes32,bytes32)',
      ];
      const roleData = [
        ['WITHDRAWER_ROLE'],
        ['WITHDRAWER_ROLE'],
        ['WITHDRAWER_ROLE'],
        ['OPEN_ROLE'],
        ['OPEN_ROLE'],
        ['UPGRADE_ROLE'],
        ['UPGRADE_ROLE'],
        ['UPGRADE_ROLE'],
        ['GOVERNOR_ROLE'],
        ['GOVERNOR_ROLE'],
        ['GOVERNOR_ROLE'],
        ['GOVERNOR_ROLE'],
      ];

      if (parentAllocationAmount.gt(0) && predictedClaimAddress) {
        targetsData.push(predictedClaimAddress);
        sigData.push('upgradeTo(address)');
        roleData.push(['UPGRADE_ROLE']);
      }

      const addActionsRolesCalldata = DAO__factory.createInterface().encodeFunctionData('execute', [
        [predictedAccessControlAddress],
        [0],
        [
          DAOAccessControl__factory.createInterface().encodeFunctionData('daoAddActionsRoles', [
            targetsData,
            sigData,
            roleData,
          ]),
        ],
      ]);

      const revokeMetafactoryRoleCalldata =
        DAOAccessControl__factory.createInterface().encodeFunctionData('userRenounceRole', [
          'EXECUTE_ROLE',
          addresses.metaFactory.address,
        ]);

      const moduleFactories = [
        addresses.treasuryModuleFactory.address,
        addresses.tokenFactory.address,
        addresses.governorFactory.address,
      ];

      const moduleFactoriesBytes = [
        treasuryFactoryCalldata,
        tokenFactoryCalldata,
        governorFactoryCalldata,
      ];

      if (parentAllocationAmount.gt(0) && claimFactoryCalldata) {
        moduleFactories.push(addresses.claimFactory.address);
        moduleFactoriesBytes.push(claimFactoryCalldata);
      }

      const targets: string[] = [predictedDAOAddress, predictedAccessControlAddress];

      const values: BigNumberish[] = [0, 0];

      const calldatas: string[] = [
        addActionsRolesCalldata, // Setup module action role configurations
        revokeMetafactoryRoleCalldata, // Revoke the Metafactory's execute role
      ];

      if (tokenSupply.bigNumberValue!.gt(tokenAllocationSum)) {
        // DAO approve Treasury to transfer tokens
        const approveDAOTokenTransferCalldata =
          VotesToken__factory.createInterface().encodeFunctionData('approve', [
            predictedTreasuryAddress,
            tokenSupply.bigNumberValue!.sub(tokenAllocationSum),
          ]);

        // DAO calls Treasury to deposit tokens into it
        const depositTokensToTreasuryCalldata =
          TreasuryModule__factory.createInterface().encodeFunctionData('depositERC20Tokens', [
            [predictedVotingTokenAddress],
            [addresses.metaFactory.address],
            [tokenSupply.bigNumberValue!.sub(tokenAllocationSum)],
          ]);

        targets.push(predictedVotingTokenAddress, predictedTreasuryAddress);
        values.push(0, 0);
        calldatas.push(approveDAOTokenTransferCalldata, depositTokensToTreasuryCalldata);
      }

      if (
        parentAllocationAmount.gt(0) &&
        predictedClaimAddress !== undefined &&
        parentToken !== undefined
      ) {
        // MetaFactory approves claimModule to transfer tokens\
        const approveDAOTokenTransferCalldata =
          VotesToken__factory.createInterface().encodeFunctionData('approve', [
            predictedClaimAddress,
            parentAllocationAmount,
          ]);

        // Metafactory inits claimModule and sends tokens
        const initClaimContractCalldata =
          ClaimSubsidiary__factory.createInterface().encodeFunctionData('initialize', [
            addresses.metaFactory.address,
            predictedAccessControlAddress,
            parentToken,
            predictedVotingTokenAddress,
            parentAllocationAmount,
          ]);

        targets.push(predictedVotingTokenAddress, predictedClaimAddress);
        values.push(0, 0);
        calldatas.push(approveDAOTokenTransferCalldata, initClaimContractCalldata);
      }

      return {
        calldata: {
          daoFactory: addresses.daoFactory.address,
          createDAOParams: createDAOParams,
          moduleFactories: moduleFactories,
          moduleFactoriesBytes: moduleFactoriesBytes,
          targets: targets,
          values: values,
          calldatas: calldatas,
        } as MetaFactoryCreateDAOData,
        predictedTreasuryAddress: predictedTreasuryAddress,
        predictedDAOAddress,
      };
    },
    [
      addresses.dao,
      addresses.daoFactory,
      addresses.accessControl,
      addresses.treasuryModuleFactory,
      addresses.treasuryModule,
      addresses.tokenFactory,
      addresses.governorFactory,
      addresses.governorModule,
      addresses.timelock,
      addresses.metaFactory,
      addresses.claimFactory,
      addresses.claimModule,
      chainId,
    ]
  );

  return createDAOData;
};

export default useCreateDAODataCreator;
