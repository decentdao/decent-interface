import {
  FractalModule__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
  GnosisSafe__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber, ethers } from 'ethers';
import { useCallback } from 'react';
import { OZLinearVoting__factory, Usul__factory } from '../../assets/typechain-types/usul';
import {
  GnosisDAO,
  GovernanceTypes,
  TokenGovernanceDAO,
} from '../../components/DaoCreator/provider/types/index';
import { buildContractCall, encodeMultiSend, getRandomBytes } from '../../helpers';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { MetaTransaction } from '../../types/transaction';
import useSafeContracts from '../safe/useSafeContracts';

const useBuildDAOTx = () => {
  const {
    state: { account, signerOrProvider },
  } = useWeb3Provider();

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
    vetoERC20VotingMasterCopyContract,
    votesMasterCopyContract,
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
            1, // Threshold
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
    (daoData: GnosisDAO | TokenGovernanceDAO, parentDAOAddress?: string) => {
      const buildTx = async () => {
        if (
          !multiSendContract ||
          !fractalNameRegistryContract ||
          !signerOrProvider ||
          !zodiacModuleProxyFactoryContract ||
          !fractalModuleMasterCopyContract
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

        // Fractal Module
        const setModuleCalldata =
          // eslint-disable-next-line camelcase
          FractalModule__factory.createInterface().encodeFunctionData('setUp', [
            ethers.utils.defaultAbiCoder.encode(
              ['address', 'address', 'address', 'address[]'],
              [
                parentDAOAddress ? parentDAOAddress : safeContract.address, // Owner -- Parent DAO
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

        let internaltTxs: MetaTransaction[];
        if (
          parentDAOAddress &&
          vetoGuardMasterCopyContract &&
          vetoMultisigVotingMasterCopyContract
        ) {
          // VETO MULTISIG
          const setVetoMultiVotingCalldata =
            // eslint-disable-next-line camelcase
            VetoMultisigVoting__factory.createInterface().encodeFunctionData('owner');
          const vetoMultisigByteCodeLinear =
            '0x602d8060093d393df3363d3d373d3d3d363d73' +
            vetoMultisigVotingMasterCopyContract.address.slice(2) +
            '5af43d82803e903d91602b57fd5bf3';
          const vetoMulitVotingSalt = solidityKeccak256(
            ['bytes32', 'uint256'],
            [solidityKeccak256(['bytes'], [setVetoMultiVotingCalldata]), saltNum]
          );
          const predictedVetoMultisigAddress = getCreate2Address(
            zodiacModuleProxyFactoryContract.address,
            vetoMulitVotingSalt,
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
                  parentDAOAddress, // Owner -- Parent DAO
                  vetoMultiContract.address, // Veto Voting
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

          internaltTxs = [
            // Name Registry
            buildContractCall(
              fractalNameRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
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
            // Deploy Veto Multisig Voting
            buildContractCall(
              zodiacModuleProxyFactoryContract,
              'deployModule',
              [vetoMultisigVotingMasterCopyContract.address, setVetoMultiVotingCalldata, saltNum],
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
                    parentDAOAddress, // Owner -- Parent DAO
                    0, // VetoVotesThreshold
                    0, // FreezeVotesThreshold
                    0, // FreezeProposalBlockDuration
                    0, // FreezeBlockDuration
                    parentDAOAddress, // ParentGnosisSafe -- Parent DAO
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
            // Remove Multisend Contract
            buildContractCall(
              safeContract,
              'removeOwner',
              [
                gnosisDaoData.trustedAddresses[gnosisDaoData.trustedAddresses.length - 1].address,
                multiSendContract.address,
                gnosisDaoData.signatureThreshold,
              ],
              0,
              false
            ),
          ];
        } else {
          internaltTxs = [
            // Name Registry
            buildContractCall(
              fractalNameRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
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

            // Remove Multisend Contract
            buildContractCall(
              safeContract,
              'removeOwner',
              [
                gnosisDaoData.trustedAddresses[gnosisDaoData.trustedAddresses.length - 1].address,
                multiSendContract.address,
                gnosisDaoData.signatureThreshold,
              ],
              0,
              false
            ),
          ];
        }

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

        // Deploy Fractal Module
        const fractalModuleTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [fractalModuleMasterCopyContract.address, setModuleCalldata, saltNum],
          0,
          false
        );

        const txs: MetaTransaction[] = [createSafeTx, fractalModuleTx, execInternalSafeTx];
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
    (daoData: GnosisDAO | TokenGovernanceDAO, parentDAOAddress?: string) => {
      const buildTx = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract?.address ||
          !usulMasterCopyContract ||
          !zodiacModuleProxyFactoryContract ||
          !linearVotingMasterCopyContract ||
          !multiSendContract ||
          !fractalNameRegistryContract ||
          !fractalModuleMasterCopyContract ||
          !signerOrProvider ||
          !votesMasterCopyContract
        ) {
          return;
        }

        const gnosisDaoData = daoData as GnosisDAO;
        const tokenGovernanceDaoData = daoData as TokenGovernanceDAO;

        const deploySafeTx = await buildDeploySafeTx(gnosisDaoData, true);

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
        const tokenByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          votesMasterCopyContract.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const tokenNonce = getRandomBytes();
        const tokenSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedSetUpTokenData]), tokenNonce]
        );
        const predictedTokenAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.address,
          tokenSalt,
          solidityKeccak256(['bytes'], [tokenByteCodeLinear])
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

        // Fractal Module
        const setModuleCalldata =
          // eslint-disable-next-line camelcase
          FractalModule__factory.createInterface().encodeFunctionData('setUp', [
            ethers.utils.defaultAbiCoder.encode(
              ['address', 'address', 'address', 'address[]'],
              [
                parentDAOAddress ? parentDAOAddress : safeContract.address, // Owner -- Parent DAO
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

        let internaltTxs: MetaTransaction[];
        if (parentDAOAddress && vetoERC20VotingMasterCopyContract && vetoGuardMasterCopyContract) {
          // VETO ERC20 Voting
          const setVetoERC20VotingCalldata =
            // eslint-disable-next-line camelcase
            VetoERC20Voting__factory.createInterface().encodeFunctionData('owner');

          const vetoERC20ByteCodeLinear =
            '0x602d8060093d393df3363d3d373d3d3d363d73' +
            vetoERC20VotingMasterCopyContract.address.slice(2) +
            '5af43d82803e903d91602b57fd5bf3';
          const vetoERC20Salt = solidityKeccak256(
            ['bytes32', 'uint256'],
            [solidityKeccak256(['bytes'], [setVetoERC20VotingCalldata]), saltNum]
          );

          const predictedVetoERC20VotingAddress = getCreate2Address(
            zodiacModuleProxyFactoryContract.address,
            vetoERC20Salt,
            solidityKeccak256(['bytes'], [vetoERC20ByteCodeLinear])
          );

          const vetoERC20VotingContract = VetoERC20Voting__factory.connect(
            predictedVetoERC20VotingAddress,
            signerOrProvider
          );

          // VETO GUARD
          const setVetoGuardCalldata =
            // eslint-disable-next-line camelcase
            VetoGuard__factory.createInterface().encodeFunctionData('setUp', [
              ethers.utils.defaultAbiCoder.encode(
                ['uint256', 'address', 'address', 'address'],
                [
                  tokenGovernanceDaoData.executionDelay, // Execution Delay
                  parentDAOAddress, // Owner -- Parent DAO
                  vetoERC20VotingContract.address, // Veto Voting
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

          const vetoGuardContract = VetoGuard__factory.connect(
            predictedVetoModuleAddress,
            signerOrProvider
          );

          internaltTxs = [
            buildContractCall(
              fractalNameRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            buildContractCall(linearVotingContract, 'setUsul', [usulContract.address], 0, false),
            buildContractCall(safeContract, 'enableModule', [usulContract.address], 0, false),

            // Enable Fractal Module
            buildContractCall(
              safeContract,
              'enableModule',
              [predictedFractalModuleAddress],
              0,
              false
            ),

            // Deploy Veto ERC20 Voting
            buildContractCall(
              zodiacModuleProxyFactoryContract,
              'deployModule',
              [vetoERC20VotingMasterCopyContract.address, setVetoERC20VotingCalldata, saltNum],
              0,
              false
            ),
            // Setup Veto ERC20 Voting
            buildContractCall(
              vetoERC20VotingContract,
              'setUp',
              [
                ethers.utils.defaultAbiCoder.encode(
                  ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
                  [
                    parentDAOAddress, // Owner -- Parent DAO
                    0, // VetoVotesThreshold
                    0, // FreezeVotesThreshold
                    0, // FreezeProposalBlockDuration
                    0, // FreezeBlockDuration
                    predictedTokenAddress, // Votes Token
                    vetoGuardContract.address, // VetoGuard
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
            buildContractCall(usulContract, 'setGuard', [vetoGuardContract.address], 0, false),

            // Add Usul Contract as the Safe owner
            buildContractCall(
              safeContract,
              'addOwnerWithThreshold',
              [usulContract.address, 1],
              0,
              false
            ),
            // Remove Multisend contract
            buildContractCall(
              safeContract,
              'removeOwner',
              [usulContract.address, multiSendContract.address, 1],
              0,
              false
            ),
          ];
        } else {
          internaltTxs = [
            buildContractCall(
              fractalNameRegistryContract,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            buildContractCall(linearVotingContract, 'setUsul', [usulContract.address], 0, false),
            buildContractCall(safeContract, 'enableModule', [usulContract.address], 0, false),
            // Enable Fractal Module
            buildContractCall(
              safeContract,
              'enableModule',
              [predictedFractalModuleAddress],
              0,
              false
            ),
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
        }

        const safeInternalTx = encodeMultiSend(internaltTxs);

        const createTokenTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [votesMasterCopyContract.address, encodedSetUpTokenData, tokenNonce],
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
        // Deploy Fractal Module
        const deployFractalModuleTx = buildContractCall(
          zodiacModuleProxyFactoryContract,
          'deployModule',
          [fractalModuleMasterCopyContract.address, setModuleCalldata, saltNum],
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
          deployFractalModuleTx,
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
      fractalNameRegistryContract,
      fractalModuleMasterCopyContract,
      vetoGuardMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      saltNum,
      signerOrProvider,
      buildDeploySafeTx,
      defaultAbiCoder,
      getCreate2Address,
      solidityKeccak256,
      AddressZero,
      votesMasterCopyContract,
    ]
  );

  const buildDao = useCallback(
    async (daoData: TokenGovernanceDAO | GnosisDAO, parentDAOAddress?: string) => {
      switch (daoData.governance) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          return buildUsulTx(daoData, parentDAOAddress);
        case GovernanceTypes.GNOSIS_SAFE:
          return buildMultisigTx(daoData, parentDAOAddress);
      }
    },
    [buildUsulTx, buildMultisigTx]
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
