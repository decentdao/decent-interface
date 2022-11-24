import {
  FractalModule__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
  VotesToken__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { GnosisSafe__factory } from '../assets/typechain-types/gnosis-safe';
import { OZLinearVoting__factory, Usul__factory } from '../assets/typechain-types/usul';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { buildContractCall, encodeMultiSend, getRandomBytes } from '../helpers';
import { MetaTransaction } from '../types/transaction';
import {
  GnosisDAO,
  GovernanceTypes,
  TokenGovernanceDAO,
} from './../components/DaoCreator/provider/types/index';
import { useAddresses } from './useAddresses';
import useSafeContracts from './useSafeContracts';

const useBuildDAOTx = () => {
  const {
    state: { account, signerOrProvider, chainId },
  } = useWeb3Provider();
  const { votesMasterCopy } = useAddresses(chainId);
  const {
    multiSendContract,
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    linearVotingMasterCopyContract,
    usulMasterCopyContract,
    zodiacModuleProxyFactoryContract,
    fractalNameRegistryContract,
    fractalModuleMasterCopyContract,
    vetoGuardMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
  } = useSafeContracts();

  const { AddressZero, HashZero } = ethers.constants;
  const { solidityKeccak256, getCreate2Address, defaultAbiCoder } = ethers.utils;
  const saltNum = getRandomBytes();

  const buildDeploySafeTx = useCallback(
    (daoData: GnosisDAO, hasUsul?: boolean) => {
      const buildTx = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract?.address ||
          !multiSendContract ||
          !signerOrProvider
        ) {
          return;
        }

        const gnosisDaoData = daoData as GnosisDAO;

        const createGnosisCalldata = gnosisSafeSingletonContract.interface.encodeFunctionData(
          'setup',
          [
            hasUsul
              ? [multiSendContract.address]
              : [
                  ...gnosisDaoData.trustedAddresses.map(trustedAddess => trustedAddess.address),
                  multiSendContract.address,
                ],
            hasUsul ? 1 : gnosisDaoData.trustedAddresses.length, // threshold
            AddressZero,
            HashZero,
            AddressZero,
            AddressZero,
            0,
            AddressZero,
          ]
        );

        const predictedGnosisSafeAddress = getCreate2Address(
          gnosisSafeFactoryContract.address,
          solidityKeccak256(
            ['bytes', 'uint256'],
            [solidityKeccak256(['bytes'], [createGnosisCalldata]), saltNum]
          ),
          solidityKeccak256(
            ['bytes', 'uint256'],
            [
              // eslint-disable-next-line camelcase
              await gnosisSafeFactoryContract.proxyCreationCode(),
              gnosisSafeSingletonContract.address,
            ]
          )
        );

        const createSafeTx = buildContractCall(
          gnosisSafeFactoryContract,
          'createProxyWithNonce',
          [gnosisSafeSingletonContract.address, createGnosisCalldata, saltNum],
          0,
          false
        );

        return {
          predictedGnosisSafeAddress,
          createSafeTx,
        };
      };

      return buildTx();
    },
    [
      account,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract,
      multiSendContract,
      signerOrProvider,
      AddressZero,
      HashZero,
      getCreate2Address,
      solidityKeccak256,
      saltNum,
    ]
  );

  const buildMultisigTx = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO, isSubdao?: boolean, parentDAOAddress?: string) => {
      const buildTx = async () => {
        if (
          !multiSendContract ||
          !fractalNameRegistryContract ||
          !signerOrProvider ||
          !zodiacModuleProxyFactoryContract ||
          !fractalModuleMasterCopyContract ||
          !vetoGuardMasterCopyContract ||
          !vetoMultisigVotingMasterCopyContract
        ) {
          return;
        }
        const gnosisDaoData = daoData as GnosisDAO;
        const deploySafeTx = await buildDeploySafeTx(gnosisDaoData);

        if (!deploySafeTx) {
          return;
        }

        const { predictedGnosisSafeAddress, createSafeTx } = deploySafeTx;

        const signatures =
          '0x000000000000000000000000' +
          multiSendContract.address.slice(2) +
          '0000000000000000000000000000000000000000000000000000000000000000' +
          '01';

        const safeContract = await GnosisSafe__factory.connect(
          predictedGnosisSafeAddress,
          signerOrProvider
        );
        const parentDAO = parentDAOAddress ? parentDAOAddress : ethers.constants.AddressZero;
        // Fractal Module
        const setModuleCalldata = isSubdao
          ? // eslint-disable-next-line camelcase
            FractalModule__factory.createInterface().encodeFunctionData('setUp', [
              ethers.utils.defaultAbiCoder.encode(
                ['address', 'address', 'address', 'address[]'],
                [
                  parentDAO, // Owner -- Parent DAO
                  safeContract.address, // Avatar
                  safeContract.address, // Target
                  [], // Authorized Controllers
                ]
              ),
            ])
          : // eslint-disable-next-line camelcase
            FractalModule__factory.createInterface().encodeFunctionData('setUp', [
              ethers.utils.defaultAbiCoder.encode(
                ['address', 'address', 'address', 'address[]'],
                [
                  safeContract.address, // Owner
                  safeContract.address, // Avatar
                  safeContract.address, // Target
                  [], // Authorized Controllers
                ]
              ),
            ]);

        const fractalByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          fractalModuleMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const fractalSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [setModuleCalldata]), saltNum]
        );
        const predictedFractalModuleAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          fractalSalt,
          solidityKeccak256(['bytes'], [fractalByteCodeLinear])
        );

        // VETO MULTISIG
        const vetoMultisigByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          vetoMultisigVotingMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const predictedVetoMultisigAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          ethers.constants.HashZero,
          solidityKeccak256(['bytes'], [vetoMultisigByteCodeLinear])
        );
        const vetoMultiContract = VetoMultisigVoting__factory.connect(
          predictedVetoMultisigAddress,
          signerOrProvider
        );

        // VETO GUARD
        const setVetoGuardCalldata =
          // eslint-disable-next-line camelcase
          VetoGuard__factory.createInterface().encodeFunctionData('setUp', [
            ethers.utils.defaultAbiCoder.encode(
              ['uint256', 'address', 'address', 'address'],
              [
                0, // Execution Delay
                parentDAO, // Owner -- Parent DAO
                predictedVetoMultisigAddress, // Veto Voting
                safeContract.address, // Gnosis Safe
              ]
            ),
          ]);
        const vetoByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          vetoGuardMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const vetoSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [setVetoGuardCalldata]), saltNum]
        );
        const predictedVetoModuleAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          vetoSalt,
          solidityKeccak256(['bytes'], [vetoByteCodeLinear])
        );

        const internaltTxs: MetaTransaction[] = isSubdao
          ? [
              // Name Registry
              buildContractCall(
                fractalNameRegistryContract,
                'updateDAOName',
                [gnosisDaoData.daoName],
                0,
                false
              ),
              // Deploy Fractal Module
              buildContractCall(
                zodiacModuleProxyFactoryContract,
                'deployModule',
                [fractalModuleMasterCopyContract.address, setModuleCalldata, saltNum],
                0,
                false
              ),
              // Enable Fractal Module
              buildContractCall(
                safeContract,
                'enableModule',
                [predictedFractalModuleAddress],
                0,
                false
              ),
              // Deploy Veto Multisig
              buildContractCall(
                zodiacModuleProxyFactoryContract,
                'deployModule',
                [vetoMultisigVotingMasterCopyContract.address, ethers.constants.HashZero, saltNum],
                0,
                false
              ),
              // Setup Veto Multisig
              buildContractCall(
                vetoMultiContract,
                'setUp',
                [
                  ethers.utils.defaultAbiCoder.encode(
                    ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
                    [
                      parentDAO, // Owner -- Parent DAO
                      0, // VetoVotesThreshold
                      0, // FreezeVotesThreshold
                      0, // FreezeProposalBlockDuration
                      0, // FreezeBlockDuration
                      parentDAO, // ParentGnosisSafe -- Parent DAO
                      predictedVetoModuleAddress, // VetoGuard
                    ]
                  ),
                ],
                0,
                false
              ),
              // Deploy Veto Guard
              buildContractCall(
                zodiacModuleProxyFactoryContract,
                'deployModule',
                [vetoGuardMasterCopyContract.address, setVetoGuardCalldata, saltNum],
                0,
                false
              ),
              // Enable Veto Guard
              buildContractCall(safeContract, 'setGuard', [predictedVetoModuleAddress], 0, false),
            ]
          : [
              // Name Registry
              buildContractCall(
                fractalNameRegistryContract,
                'updateDAOName',
                [gnosisDaoData.daoName],
                0,
                false
              ),
              // Deploy Fractal Module
              buildContractCall(
                zodiacModuleProxyFactoryContract,
                'deployModule',
                [fractalModuleMasterCopyContract.address, setModuleCalldata, saltNum],
                0,
                false
              ),
              // Enable Fractal Module
              buildContractCall(
                safeContract,
                'enableModule',
                [predictedFractalModuleAddress],
                0,
                false
              ),
            ];
        const safeInternalTx = encodeMultiSend(internaltTxs);
        const execInternalSafeTx = buildContractCall(
          safeContract,
          'execTransaction',
          [
            multiSendContract.address, // to
            '0', // value
            multiSendContract.interface.encodeFunctionData('multiSend', [safeInternalTx]), // calldata
            '1', // operation
            '0', // tx gas
            '0', // base gas
            '0', // gas price
            AddressZero, // gas token
            AddressZero, // receiver
            signatures, // sigs
          ],
          0,
          false
        );

        const txs: MetaTransaction[] = [createSafeTx, execInternalSafeTx];
        const safeTx = encodeMultiSend(txs);

        return { predictedGnosisSafeAddress, createSafeTx, safeTx };
      };

      return buildTx();
    },
    [
      multiSendContract,
      fractalNameRegistryContract,
      signerOrProvider,
      buildDeploySafeTx,
      AddressZero,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      getCreate2Address,
      solidityKeccak256,
      saltNum,
      vetoGuardMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
    ]
  );
  const buildUsulTx = useCallback(
    (daoData: GnosisDAO | TokenGovernanceDAO) => {
      const buildTx = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract?.address ||
          !usulMasterCopyContract ||
          !zodiacModuleProxyFactoryContract ||
          !linearVotingMasterCopyContract ||
          !multiSendContract ||
          !votesMasterCopy ||
          !fractalNameRegistryContract ||
          !signerOrProvider
        ) {
          return;
        }

        const gnosisDaoData = daoData as GnosisDAO;
        const tokenGovernanceDaoData = daoData as TokenGovernanceDAO;

        const deploySafeTx = await buildDeploySafeTx(gnosisDaoData, true);
        const votesMasterCopyContract = VotesToken__factory.connect(
          votesMasterCopy.address,
          signerOrProvider
        );

        if (!deploySafeTx) {
          return;
        }

        const { predictedGnosisSafeAddress, createSafeTx } = deploySafeTx;

        const tokenAllocationsOwners = tokenGovernanceDaoData.tokenAllocations.map(
          tokenAllocation => tokenAllocation.address
        );
        const tokenAllocationsValues = tokenGovernanceDaoData.tokenAllocations.map(
          tokenAllocation => tokenAllocation.amount.bigNumberValue!
        );

        const tokenAllocationSum: BigNumber = tokenAllocationsValues.reduce(
          (accumulator, tokenAllocation) => {
            return tokenAllocation!.add(accumulator);
          },
          BigNumber.from(0)
        );

        if (tokenGovernanceDaoData.tokenSupply.bigNumberValue!.gt(tokenAllocationSum)) {
          tokenAllocationsOwners.push(predictedGnosisSafeAddress);
          tokenAllocationsValues.push(
            tokenGovernanceDaoData.tokenSupply.bigNumberValue!.sub(tokenAllocationSum)
          );
        }

        const encodedInitTokenData = defaultAbiCoder.encode(
          ['string', 'string', 'address[]', 'uint256[]'],
          [
            tokenGovernanceDaoData.tokenName,
            tokenGovernanceDaoData.tokenSymbol,
            tokenAllocationsOwners,
            tokenAllocationsValues,
          ]
        );

        const encodedSetUpTokenData = votesMasterCopyContract.interface.encodeFunctionData(
          'setUp',
          [encodedInitTokenData]
        );
        const tokenSalt = getRandomBytes();
        const predictedTokenAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          tokenSalt,
          solidityKeccak256(['bytes'], [VotesToken__factory.bytecode])
        );

        const encodedStrategyInitParams = defaultAbiCoder.encode(
          ['address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
          [
            predictedGnosisSafeAddress, // owner
            predictedTokenAddress,
            '0x0000000000000000000000000000000000000001',
            tokenGovernanceDaoData.votingPeriod,
            tokenGovernanceDaoData.quorum,
            tokenGovernanceDaoData.executionDelay,
            'linearVoting',
          ]
        );

        const encodedStrategySetUpData =
          linearVotingMasterCopyContract.interface.encodeFunctionData('setUp', [
            encodedStrategyInitParams,
          ]);
        const strategyByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          linearVotingMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const strategyNonce = getRandomBytes();
        const strategySalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedStrategySetUpData]), strategyNonce]
        );
        const predictedStrategyAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          strategySalt,
          solidityKeccak256(['bytes'], [strategyByteCodeLinear])
        );

        const encodedInitUsulData = defaultAbiCoder.encode(
          ['address', 'address', 'address', 'address[]'],
          [
            predictedGnosisSafeAddress,
            predictedGnosisSafeAddress,
            predictedGnosisSafeAddress,
            [predictedStrategyAddress],
          ]
        );
        const encodedSetupUsulData = usulMasterCopyContract.interface.encodeFunctionData('setUp', [
          encodedInitUsulData,
        ]);

        const usulByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          usulMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const usulNonce = getRandomBytes();
        const usulSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedSetupUsulData]), usulNonce]
        );
        const predictedUsulAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          usulSalt,
          solidityKeccak256(['bytes'], [usulByteCodeLinear])
        );

        const signatures =
          '0x000000000000000000000000' +
          multiSendContract.address.slice(2) +
          '0000000000000000000000000000000000000000000000000000000000000000' +
          '01';

        const safeContract = await GnosisSafe__factory.connect(
          predictedGnosisSafeAddress,
          signerOrProvider
        );
        const usulContract = await Usul__factory.connect(predictedUsulAddress, signerOrProvider);
        const linearVotingContract = await OZLinearVoting__factory.connect(
          predictedStrategyAddress,
          signerOrProvider
        );

        const internaltTxs: MetaTransaction[] = [
          buildContractCall(
            fractalNameRegistryContract,
            'updateDAOName',
            [gnosisDaoData.daoName],
            0,
            false
          ),
          buildContractCall(linearVotingContract, 'setUsul', [usulContract.address], 0, false),
          buildContractCall(safeContract, 'enableModule', [usulContract.address], 0, false),
          buildContractCall(
            safeContract,
            'addOwnerWithThreshold',
            [usulContract.address, 1],
            0,
            false
          ),
          buildContractCall(
            safeContract,
            'removeOwner',
            [usulContract.address, multiSendContract.address, 1],
            0,
            false
          ),
        ];
        const safeInternalTx = encodeMultiSend(internaltTxs);

        const createTokenTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [votesMasterCopyContract.address, encodedSetUpTokenData, tokenSalt],
          0,
          false
        );

        const deployStrategyTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [linearVotingMasterCopyContract.address, encodedStrategySetUpData, strategyNonce],
          0,
          false
        );
        const deployUsulTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [usulMasterCopyContract.address, encodedSetupUsulData, usulNonce],
          0,
          false
        );
        const execInternalSafeTx = buildContractCall(
          safeContract,
          'execTransaction',
          [
            multiSendContract.address, // to
            '0', // value
            multiSendContract.interface.encodeFunctionData('multiSend', [safeInternalTx]), // calldata
            '1', // operation
            '0', // tx gas
            '0', // base gas
            '0', // gas price
            AddressZero, // gas token
            AddressZero, // receiver
            signatures, // sigs
          ],
          0,
          false
        );

        const txs: MetaTransaction[] = [
          createSafeTx,
          createTokenTx,
          deployStrategyTx,
          deployUsulTx,
          execInternalSafeTx,
        ];
        const safeTx = encodeMultiSend(txs);

        return { predictedGnosisSafeAddress, createSafeTx, safeTx };
      };

      return buildTx();
    },
    [
      account,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract?.address,
      usulMasterCopyContract,
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      multiSendContract,
      votesMasterCopy,
      fractalNameRegistryContract,
      signerOrProvider,
      buildDeploySafeTx,
      defaultAbiCoder,
      getCreate2Address,
      solidityKeccak256,
      AddressZero,
    ]
  );

  const buildDao = useCallback(
    async (
      daoData: TokenGovernanceDAO | GnosisDAO,
      isSubdao?: boolean,
      parentDAOAddress?: string
    ) => {
      switch (daoData.governance) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          return buildUsulTx(daoData);
        case GovernanceTypes.GNOSIS_SAFE:
          return buildMultisigTx(daoData, isSubdao, parentDAOAddress);
      }
    },
    [buildUsulTx, buildMultisigTx]
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
