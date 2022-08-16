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
import {
  ClaimSubsidiary__factory,
  VotesToken__factory,
} from '../assets/typechain-types/votes-token';
import { TreasuryModule__factory } from '../assets/typechain-types/metafactory';

type CreateDAOData = (
  data: {
    creator: string;
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
    parentAllocationAmount?: string;
  },
  parentToken?: string
) => undefined | { calldata: MetaFactoryCreateDAOData; predictedTreasuryAddress: string };

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
        parentAllocationAmount,
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

      const daoAndAccessControlSalt = ethers.utils.formatBytes32String(
        self.crypto.getRandomValues(new BigUint64Array(1))[0].toString()
      );
      const treasurySalt = ethers.utils.formatBytes32String(
        self.crypto.getRandomValues(new BigUint64Array(1))[0].toString()
      );
      const tokenSalt = ethers.utils.formatBytes32String(
        self.crypto.getRandomValues(new BigUint64Array(1))[0].toString()
      );
      const governorAndTimelockSalt = ethers.utils.formatBytes32String(
        self.crypto.getRandomValues(new BigUint64Array(1))[0].toString()
      );
      const pAllocatedAmount = Number(parentAllocationAmount);
      let claimSubsidiarySalt;
      if (pAllocatedAmount > 0) {
        claimSubsidiarySalt = ethers.utils.formatBytes32String(
          self.crypto.getRandomValues(new BigUint64Array(1))[0].toString()
        );
      }

      const tokenAllocationData = [...tokenAllocations];

      const predictedDAOAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, daoAndAccessControlSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            ERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.dao.address, []]),
          ]
        )
      );

      const predictedAccessControlAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, daoAndAccessControlSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            ERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.accessControl.address, []]),
          ]
        )
      );

      const predictedTreasuryAddress = ethers.utils.getCreate2Address(
        addresses.treasuryModuleFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, treasurySalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            ERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.treasuryModule.address, []]),
          ]
        )
      );

      // If parentAllocationAmount is greater than zero,
      // Then mint the allocation to the Metafactory, to be be transferred
      // to the claim Subsidiary
      if (pAllocatedAmount > 0) {
        const parentTokenAllocation: TokenAllocation = {
          address: addresses.metaFactory.address,
          amount: Number(parentAllocationAmount),
        };
        tokenAllocationData.push(parentTokenAllocation);
      }

      // If the total token supply is greater than the sum of allocations,
      // Then mint the token difference into the Metafactory, to be deposited
      // into the treasury
      const tokenSupplyNumber = Number(tokenSupply);
      const tokenAllocationSum = tokenAllocationData.reduce((accumulator, tokenAllocation) => {
        return accumulator + tokenAllocation.amount;
      }, 0);

      if (tokenSupplyNumber > tokenAllocationSum) {
        const daoTokenAllocation: TokenAllocation = {
          address: addresses.metaFactory.address,
          amount: tokenSupplyNumber - tokenAllocationSum,
        };
        tokenAllocationData.push(daoTokenAllocation);
      }

      const predictedTokenAddress = ethers.utils.getCreate2Address(
        addresses.tokenFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, tokenSalt]
        ),
        ethers.utils.solidityKeccak256(
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
                tokenAllocationData.map(tokenAllocation =>
                  ethers.utils.parseUnits(tokenAllocation.amount.toString(), 18)
                ),
              ]
            ),
          ]
        )
      );

      const predictedGovernorAddress = ethers.utils.getCreate2Address(
        addresses.governorFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, governorAndTimelockSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            ERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.governorModule.address, []]),
          ]
        )
      );

      const predictedTimelockAddress = ethers.utils.getCreate2Address(
        addresses.governorFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, governorAndTimelockSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            ERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.timelock.address, []]),
          ]
        )
      );
      let predictedClaimAddress;
      if (pAllocatedAmount > 0) {
        predictedClaimAddress = ethers.utils.getCreate2Address(
          addresses.claimFactory.address,
          ethers.utils.solidityKeccak256(
            ['address', 'address', 'uint256', 'bytes32'],
            [creator, addresses.metaFactory.address, chainId, claimSubsidiarySalt]
          ),
          ethers.utils.solidityKeccak256(
            ['bytes', 'bytes'],
            [
              // eslint-disable-next-line camelcase
              ERC1967Proxy__factory.bytecode,
              abiCoder.encode(['address', 'bytes'], [addresses.claimModule.address, []]),
            ]
          )
        );
      }

      const createDAOParams = {
        daoImplementation: addresses.dao.address,
        accessControlImplementation: addresses.accessControl.address,
        daoName: daoName,
        salt: daoAndAccessControlSalt,
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
        abiCoder.encode(['bytes32'], [treasurySalt]),
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
          [
            tokenAllocationData.map(tokenAllocation =>
              ethers.utils.parseUnits(tokenAllocation.amount.toString(), 18)
            ),
          ]
        ),
        abiCoder.encode(['bytes32'], [tokenSalt]),
      ];

      const governorFactoryCalldata = [
        abiCoder.encode(['address'], [predictedDAOAddress]), // Address of DAO to be deployed
        abiCoder.encode(['address'], [predictedAccessControlAddress]), // Address of Access Control to be deployed
        abiCoder.encode(['address'], [predictedTokenAddress]), // Address of token to be deployed
        abiCoder.encode(['address'], [addresses.governorModule.address]), // Address of Governance module implementation contract
        abiCoder.encode(['address'], [addresses.timelock.address]), // Address of Timelock module implementation contract
        abiCoder.encode(['uint64'], [BigNumber.from(lateQuorumExecution)]), // Vote extension
        abiCoder.encode(['uint256'], [BigNumber.from(voteStartDelay)]), // Vote delay
        abiCoder.encode(['uint256'], [BigNumber.from(votingPeriod)]), // Vote period
        abiCoder.encode(
          ['uint256'],
          [BigNumber.from(ethers.utils.parseUnits(proposalThreshold, 18))]
        ), // Threshold
        abiCoder.encode(['uint256'], [BigNumber.from(quorum)]), // Quorum
        abiCoder.encode(['uint256'], [BigNumber.from(executionDelay)]), // Execution delay
        abiCoder.encode(['bytes32'], [governorAndTimelockSalt]), // Create2 salt
      ];

      let claimFactoryCalldata;
      if (pAllocatedAmount > 0) {
        claimFactoryCalldata = [
          abiCoder.encode(['address'], [addresses.claimModule.address]),
          abiCoder.encode(['bytes32'], [claimSubsidiarySalt]),
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

      if (pAllocatedAmount > 0 && predictedClaimAddress) {
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

      if (pAllocatedAmount > 0 && claimFactoryCalldata) {
        moduleFactories.push(addresses.claimFactory.address);
        moduleFactoriesBytes.push(claimFactoryCalldata);
      }

      const targets: string[] = [predictedDAOAddress, predictedAccessControlAddress];

      const values: BigNumberish[] = [0, 0];

      const calldatas: string[] = [
        addActionsRolesCalldata, // Setup module action role configurations
        revokeMetafactoryRoleCalldata, // Revoke the Metafactory's execute role
      ];

      if (tokenSupplyNumber > tokenAllocationSum) {
        // DAO approve Treasury to transfer tokens
        const approveDAOTokenTransferCalldata =
          VotesToken__factory.createInterface().encodeFunctionData('approve', [
            predictedTreasuryAddress,
            ethers.utils.parseUnits((tokenSupplyNumber - tokenAllocationSum).toString(), 18),
          ]);

        // DAO calls Treasury to deposit tokens into it
        const depositTokensToTreasuryCalldata =
          TreasuryModule__factory.createInterface().encodeFunctionData('depositERC20Tokens', [
            [predictedTokenAddress],
            [addresses.metaFactory.address],
            [ethers.utils.parseUnits((tokenSupplyNumber - tokenAllocationSum).toString(), 18)],
          ]);

        targets.push(predictedTokenAddress, predictedTreasuryAddress);
        values.push(0, 0);
        calldatas.push(approveDAOTokenTransferCalldata, depositTokensToTreasuryCalldata);
      }

      if (
        pAllocatedAmount > 0 &&
        predictedClaimAddress !== undefined &&
        parentToken !== undefined
      ) {
        // MetaFactory approves claimModule to transfer tokens\
        const approveDAOTokenTransferCalldata =
          VotesToken__factory.createInterface().encodeFunctionData('approve', [
            predictedClaimAddress,
            ethers.utils.parseUnits(pAllocatedAmount.toString(), 18),
          ]);

        // Metafactory inits claimModule and sends tokens
        const initClaimContractCalldata =
          ClaimSubsidiary__factory.createInterface().encodeFunctionData('initialize', [
            addresses.metaFactory.address,
            predictedAccessControlAddress,
            parentToken,
            predictedTokenAddress,
            ethers.utils.parseUnits(pAllocatedAmount.toString(), 18),
          ]);

        targets.push(predictedTokenAddress, predictedClaimAddress);
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
