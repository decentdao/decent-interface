import {
  OZLinearVoting__factory,
  FractalUsul__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  GnosisSafe__factory,
  UsulVetoGuard__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber, ethers } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useProvider, useSigner, useAccount } from 'wagmi';
import { GnosisDAO, SubDAO, TokenGovernanceDAO } from '../../components/DaoCreator/provider/types';
import { buildContractCall, encodeMultiSend, getRandomBytes } from '../../helpers';
import { FractalModuleData, fractalModuleData } from '../../helpers/BuildDAOTx/fractalModuleData';
import { vetoVotesContractData } from '../../helpers/BuildDAOTx/vetoVotesContractData';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { MetaTransaction } from '../../types';
import useSafeContracts from '../safe/useSafeContracts';

/**
 * The various time periods we use in DAO creation are all denoted *on chain* in SECONDS.
 * However, from the UI/user's perspective, the input fields are denoted in MINUTES.
 *
 * Thus the data from the user inputs must be converted to seconds before passing into
 * the transaction.  This applies to:
 *
 * votingPeriod
 * executionPeriod
 * timelockPeriod
 * freezeProposalPeriod
 * freezePeriod
 *
 * The UI defaults (in minutes) are defined in {@link CreatorProvider}.
 */
const TIMER_MULT = 60;

const useBuildDAOTx = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  const { address: account } = useAccount();

  const {
    multiSendContract,
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    linearVotingMasterCopyContract,
    fractalUsulMasterCopyContract,
    zodiacModuleProxyFactoryContract,
    fractalRegistryContract,
    fractalModuleMasterCopyContract,
    gnosisVetoGuardMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    vetoERC20VotingMasterCopyContract,
    votesTokenMasterCopyContract,
  } = useSafeContracts();

  const { AddressZero, HashZero } = ethers.constants;
  const { solidityKeccak256, getCreate2Address, defaultAbiCoder } = ethers.utils;
  const saltNum = getRandomBytes();

  const buildVetoGuardData = useCallback(
    ({
      executionPeriod,
      parentDAOAddress,
      vetoVotingAddress,
      safeAddress,
      usulAddress,
      strategyAddress,
      timelockPeriod,
    }: {
      executionPeriod: BigNumber;
      parentDAOAddress: string;
      vetoVotingAddress: string;
      safeAddress: string;
      usulAddress?: string;
      strategyAddress?: string;
      timelockPeriod?: BigNumber;
    }) => {
      const buildVetoGuard = async () => {
        if (
          !gnosisVetoGuardMasterCopyContract ||
          !usulVetoGuardMasterCopyContract ||
          !zodiacModuleProxyFactoryContract
        ) {
          return;
        }

        // VETO GUARD Contract
        // If dao config is a usul dao, then we must utilize the usulVetoGuard
        const vetoGuardMasterCopyContract = usulAddress
          ? usulVetoGuardMasterCopyContract
          : gnosisVetoGuardMasterCopyContract;

        const vetoGuardType = usulAddress ? UsulVetoGuard__factory : VetoGuard__factory;

        const setVetoGuardCalldata = vetoGuardType.createInterface().encodeFunctionData('setUp', [
          usulAddress
            ? ethers.utils.defaultAbiCoder.encode(
                ['address', 'address', 'address', 'address', 'uint256'],
                [
                  parentDAOAddress, // Owner -- Parent DAO
                  vetoVotingAddress, // Veto Voting
                  strategyAddress, // Base Strategy
                  usulAddress, // USUL
                  executionPeriod.mul(TIMER_MULT), // Execution Period
                ]
              )
            : ethers.utils.defaultAbiCoder.encode(
                ['uint256', 'uint256', 'address', 'address', 'address'],
                [
                  timelockPeriod?.mul(TIMER_MULT), // Timelock Period
                  executionPeriod.mul(TIMER_MULT), // Execution Period
                  parentDAOAddress, // Owner -- Parent DAO
                  vetoVotingAddress, // Veto Voting
                  safeAddress, // Gnosis Safe
                ]
              ),
        ]);
        const vetoGuardByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          vetoGuardMasterCopyContract.asSigner.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const vetoGuardSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [setVetoGuardCalldata]), saltNum]
        );
        return {
          predictedVetoModuleAddress: getCreate2Address(
            zodiacModuleProxyFactoryContract.asSigner.address,
            vetoGuardSalt,
            solidityKeccak256(['bytes'], [vetoGuardByteCodeLinear])
          ),
          setVetoGuardCalldata: setVetoGuardCalldata,
        };
      };
      return buildVetoGuard();
    },
    [
      getCreate2Address,
      gnosisVetoGuardMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      saltNum,
      solidityKeccak256,
      zodiacModuleProxyFactoryContract,
    ]
  );
  const buildDeploySafeTx = useCallback(
    (daoData: GnosisDAO, hasUsul?: boolean) => {
      const buildTx = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract ||
          !multiSendContract ||
          !signerOrProvider
        ) {
          return;
        }

        const gnosisDaoData = daoData as GnosisDAO;

        const signers = hasUsul
          ? [multiSendContract.asSigner.address]
          : [
              ...gnosisDaoData.trustedAddresses.map(trustedAddess => trustedAddess.address),
              multiSendContract.asSigner.address,
            ];

        const createGnosisCalldata =
          gnosisSafeSingletonContract.asSigner.interface.encodeFunctionData('setup', [
            signers,
            1, // Threshold
            AddressZero,
            HashZero,
            AddressZero,
            AddressZero,
            0,
            AddressZero,
          ]);

        const predictedGnosisSafeAddress = getCreate2Address(
          gnosisSafeFactoryContract.asSigner.address,
          solidityKeccak256(
            ['bytes', 'uint256'],
            [solidityKeccak256(['bytes'], [createGnosisCalldata]), saltNum]
          ),
          solidityKeccak256(
            ['bytes', 'uint256'],
            [
              await gnosisSafeFactoryContract.asSigner.proxyCreationCode(),
              gnosisSafeSingletonContract.asSigner.address,
            ]
          )
        );

        const createSafeTx = buildContractCall(
          gnosisSafeFactoryContract.asSigner,
          'createProxyWithNonce',
          [gnosisSafeSingletonContract.asSigner.address, createGnosisCalldata, saltNum],
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
    (
      daoData: GnosisDAO | TokenGovernanceDAO,
      parentDAOAddress?: string,
      parentTokenAddress?: string
    ) => {
      const buildTx = async () => {
        if (
          !multiSendContract ||
          !fractalRegistryContract ||
          !signerOrProvider ||
          !zodiacModuleProxyFactoryContract ||
          !fractalModuleMasterCopyContract ||
          !gnosisVetoGuardMasterCopyContract ||
          !vetoMultisigVotingMasterCopyContract ||
          !vetoERC20VotingMasterCopyContract
        ) {
          return;
        }
        const gnosisDaoData = daoData as GnosisDAO;
        const deploySafeTx = await buildDeploySafeTx(gnosisDaoData, false);

        if (!deploySafeTx) {
          return;
        }

        const { predictedGnosisSafeAddress, createSafeTx } = deploySafeTx;

        const signatures =
          '0x000000000000000000000000' +
          multiSendContract.asSigner.address.slice(2) +
          '0000000000000000000000000000000000000000000000000000000000000000' +
          '01';

        const safeContract = GnosisSafe__factory.connect(
          predictedGnosisSafeAddress,
          signerOrProvider
        );

        let internalTxs: MetaTransaction[];

        // Fractal Module (only applied to childDAOs)
        const { predictedFractalModuleAddress, deployFractalModuleTx }: FractalModuleData =
          fractalModuleData(
            fractalModuleMasterCopyContract.asSigner,
            zodiacModuleProxyFactoryContract.asSigner,
            safeContract,
            saltNum,
            parentDAOAddress
          );

        if (parentDAOAddress) {
          // childDAO
          const subDAOData = daoData as SubDAO;

          // Veto Votes
          const { vetoVotingAddress, setVetoVotingCalldata, vetoVotesType } =
            await vetoVotesContractData(
              vetoERC20VotingMasterCopyContract.asSigner,
              vetoMultisigVotingMasterCopyContract.asSigner,
              zodiacModuleProxyFactoryContract.asSigner,
              saltNum,
              parentTokenAddress
            );

          // Veto Guard
          const deployVetoGuardTx = await buildVetoGuardData({
            executionPeriod: subDAOData.executionPeriod,
            parentDAOAddress: parentDAOAddress,
            vetoVotingAddress: vetoVotingAddress,
            safeAddress: safeContract.address,
            timelockPeriod: subDAOData.timelockPeriod,
          });
          if (!deployVetoGuardTx) {
            return;
          }
          const { predictedVetoModuleAddress, setVetoGuardCalldata } = deployVetoGuardTx;

          internalTxs = [
            // Name Registry
            buildContractCall(
              fractalRegistryContract.asSigner,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            // Enable Fractal Module b/c this DAO has a parent
            buildContractCall(
              safeContract,
              'enableModule',
              [predictedFractalModuleAddress],
              0,
              false
            ),
            // Deploy Veto Voting
            buildContractCall(
              zodiacModuleProxyFactoryContract.asSigner,
              'deployModule',
              [
                vetoVotesType === VetoERC20Voting__factory
                  ? vetoERC20VotingMasterCopyContract.asSigner.address
                  : vetoMultisigVotingMasterCopyContract.asSigner.address,
                setVetoVotingCalldata,
                saltNum,
              ],
              0,
              false
            ),
            // Setup Veto Voting
            buildContractCall(
              vetoVotesType.connect(vetoVotingAddress, signerOrProvider),
              'setUp',
              [
                ethers.utils.defaultAbiCoder.encode(
                  ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
                  [
                    parentDAOAddress, // Owner -- Parent DAO
                    subDAOData.vetoVotesThreshold, // VetoVotesThreshold
                    subDAOData.freezeVotesThreshold, // FreezeVotesThreshold
                    subDAOData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
                    subDAOData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
                    parentTokenAddress ? parentTokenAddress : parentDAOAddress, // ParentGnosisSafe or Votes Token
                    predictedVetoModuleAddress, // VetoGuard
                  ]
                ),
              ],
              0,
              false
            ),
            // Deploy Veto Guard
            buildContractCall(
              zodiacModuleProxyFactoryContract.asSigner,
              'deployModule',
              [gnosisVetoGuardMasterCopyContract.asSigner.address, setVetoGuardCalldata, saltNum],
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
                multiSendContract.asSigner.address,
                gnosisDaoData.signatureThreshold,
              ],
              0,
              false
            ),
          ];
        } else {
          // rootDAO
          internalTxs = [
            // Name Registry
            buildContractCall(
              fractalRegistryContract.asSigner,
              'updateDAOName',
              [gnosisDaoData.daoName],
              0,
              false
            ),
            // Remove Multisend Contract
            buildContractCall(
              safeContract,
              'removeOwner',
              [
                gnosisDaoData.trustedAddresses[gnosisDaoData.trustedAddresses.length - 1].address,
                multiSendContract.asSigner.address,
                gnosisDaoData.signatureThreshold,
              ],
              0,
              false
            ),
          ];
        }

        const safeInternalTx = encodeMultiSend(internalTxs);
        const execInternalSafeTx = buildContractCall(
          safeContract,
          'execTransaction',
          [
            multiSendContract.asSigner.address, // to
            '0', // value
            multiSendContract.asSigner.interface.encodeFunctionData('multiSend', [safeInternalTx]), // calldata
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

        // If childDAO, deploy Fractal Module
        if (parentDAOAddress) {
          txs.splice(1, 0, deployFractalModuleTx);
        }

        const safeTx = encodeMultiSend(txs);

        return { predictedGnosisSafeAddress, createSafeTx, safeTx };
      };

      return buildTx();
    },
    [
      multiSendContract,
      fractalRegistryContract,
      signerOrProvider,
      buildDeploySafeTx,
      buildVetoGuardData,
      vetoERC20VotingMasterCopyContract,
      AddressZero,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      saltNum,
      gnosisVetoGuardMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
    ]
  );
  const buildUsulTx = useCallback(
    (
      daoData: GnosisDAO | TokenGovernanceDAO,
      parentDAOAddress?: string,
      parentTokenAddress?: string
    ) => {
      const buildTx = async () => {
        if (
          !account ||
          !gnosisSafeFactoryContract ||
          !gnosisSafeSingletonContract ||
          !fractalUsulMasterCopyContract ||
          !zodiacModuleProxyFactoryContract ||
          !linearVotingMasterCopyContract ||
          !multiSendContract ||
          !fractalRegistryContract ||
          !fractalModuleMasterCopyContract ||
          !vetoMultisigVotingMasterCopyContract ||
          !signerOrProvider ||
          !votesTokenMasterCopyContract ||
          !vetoERC20VotingMasterCopyContract ||
          !usulVetoGuardMasterCopyContract
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
          tokenAllocation => tokenAllocation.amount || BigNumber.from(0)
        );

        const tokenAllocationSum = tokenAllocationsValues.reduce((accumulator, tokenAllocation) => {
          return tokenAllocation!.add(accumulator);
        }, BigNumber.from(0));

        if (tokenGovernanceDaoData.tokenSupply.gt(tokenAllocationSum)) {
          tokenAllocationsOwners.push(predictedGnosisSafeAddress);
          tokenAllocationsValues.push(tokenGovernanceDaoData.tokenSupply.sub(tokenAllocationSum));
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

        const encodedSetUpTokenData =
          votesTokenMasterCopyContract.asSigner.interface.encodeFunctionData('setUp', [
            encodedInitTokenData,
          ]);
        const tokenByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          votesTokenMasterCopyContract.asSigner.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const tokenNonce = getRandomBytes();
        const tokenSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedSetUpTokenData]), tokenNonce]
        );
        const predictedTokenAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.asSigner.address,
          tokenSalt,
          solidityKeccak256(['bytes'], [tokenByteCodeLinear])
        );

        const encodedStrategyInitParams = defaultAbiCoder.encode(
          ['address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
          [
            predictedGnosisSafeAddress, // owner
            predictedTokenAddress,
            '0x0000000000000000000000000000000000000001',
            tokenGovernanceDaoData.votingPeriod.mul(TIMER_MULT),
            tokenGovernanceDaoData.quorumPercentage,
            tokenGovernanceDaoData.timelock.mul(TIMER_MULT),
            'linearVoting',
          ]
        );

        const encodedStrategySetUpData =
          linearVotingMasterCopyContract.asSigner.interface.encodeFunctionData('setUp', [
            encodedStrategyInitParams,
          ]);
        const strategyByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          linearVotingMasterCopyContract.asSigner.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const strategyNonce = getRandomBytes();
        const strategySalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedStrategySetUpData]), strategyNonce]
        );
        const predictedStrategyAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.asSigner.address,
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
        const encodedSetupUsulData =
          fractalUsulMasterCopyContract.asSigner.interface.encodeFunctionData('setUp', [
            encodedInitUsulData,
          ]);

        const usulByteCodeLinear =
          '0x602d8060093d393df3363d3d373d3d3d363d73' +
          fractalUsulMasterCopyContract.asSigner.address.slice(2) +
          '5af43d82803e903d91602b57fd5bf3';
        const usulNonce = getRandomBytes();
        const usulSalt = solidityKeccak256(
          ['bytes32', 'uint256'],
          [solidityKeccak256(['bytes'], [encodedSetupUsulData]), usulNonce]
        );
        const predictedUsulAddress = getCreate2Address(
          zodiacModuleProxyFactoryContract.asSigner.address,
          usulSalt,
          solidityKeccak256(['bytes'], [usulByteCodeLinear])
        );

        const signatures =
          '0x000000000000000000000000' +
          multiSendContract.asSigner.address.slice(2) +
          '0000000000000000000000000000000000000000000000000000000000000000' +
          '01';

        const safeContract = GnosisSafe__factory.connect(
          predictedGnosisSafeAddress,
          signerOrProvider
        );
        const usulContract = FractalUsul__factory.connect(predictedUsulAddress, signerOrProvider);
        const linearVotingContract = OZLinearVoting__factory.connect(
          predictedStrategyAddress,
          signerOrProvider
        );

        // Fractal Module
        const { predictedFractalModuleAddress, deployFractalModuleTx }: FractalModuleData =
          fractalModuleData(
            fractalModuleMasterCopyContract.asSigner,
            zodiacModuleProxyFactoryContract.asSigner,
            safeContract,
            saltNum,
            parentDAOAddress
          );

        let internalTxs: MetaTransaction[];
        if (parentDAOAddress) {
          const subDAOData = daoData as SubDAO;

          // Veto Votes
          const { vetoVotingAddress, setVetoVotingCalldata, vetoVotesType } =
            await vetoVotesContractData(
              vetoERC20VotingMasterCopyContract.asSigner,
              vetoMultisigVotingMasterCopyContract.asSigner,
              zodiacModuleProxyFactoryContract.asSigner,
              saltNum,
              parentTokenAddress
            );

          // Veto Guard
          const deployVetoGuardTx = await buildVetoGuardData({
            executionPeriod: subDAOData.executionPeriod,
            parentDAOAddress: parentDAOAddress,
            vetoVotingAddress: vetoVotingAddress,
            safeAddress: safeContract.address,
            usulAddress: predictedUsulAddress,
            strategyAddress: predictedStrategyAddress,
          });
          if (!deployVetoGuardTx) {
            return;
          }
          const { predictedVetoModuleAddress, setVetoGuardCalldata } = deployVetoGuardTx;
          internalTxs = [
            buildContractCall(
              fractalRegistryContract.asSigner,
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

            // Deploy Veto Voting
            buildContractCall(
              zodiacModuleProxyFactoryContract.asSigner,
              'deployModule',
              [
                vetoVotesType === VetoERC20Voting__factory
                  ? vetoERC20VotingMasterCopyContract.asSigner.address
                  : vetoMultisigVotingMasterCopyContract.asSigner.address,
                setVetoVotingCalldata,
                saltNum,
              ],
              0,
              false
            ),
            // Setup Veto Voting
            buildContractCall(
              vetoVotesType.connect(vetoVotingAddress, signerOrProvider),
              'setUp',
              [
                ethers.utils.defaultAbiCoder.encode(
                  ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
                  [
                    parentDAOAddress, // Owner -- Parent DAO
                    subDAOData.vetoVotesThreshold, // VetoVotesThreshold
                    subDAOData.freezeVotesThreshold, // FreezeVotesThreshold
                    subDAOData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
                    subDAOData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
                    parentTokenAddress ? parentTokenAddress : parentDAOAddress, // ParentGnosisSafe or Votes Token
                    predictedVetoModuleAddress, // VetoGuard
                  ]
                ),
              ],
              0,
              false
            ),

            // Deploy Veto Guard
            buildContractCall(
              zodiacModuleProxyFactoryContract.asSigner,
              'deployModule',
              [usulVetoGuardMasterCopyContract.asSigner.address, setVetoGuardCalldata, saltNum],
              0,
              false
            ),
            // Enable Veto Guard
            buildContractCall(usulContract, 'setGuard', [predictedVetoModuleAddress], 0, false),

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
              [usulContract.address, multiSendContract.asSigner.address, 1],
              0,
              false
            ),
          ];
        } else {
          // rootDAO
          internalTxs = [
            buildContractCall(
              fractalRegistryContract.asSigner,
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
              [usulContract.address, multiSendContract.asSigner.address, 1],
              0,
              false
            ),
          ];
        }
        const safeInternalTx = encodeMultiSend(internalTxs);

        const createTokenTx = buildContractCall(
          zodiacModuleProxyFactoryContract.asSigner,
          'deployModule',
          [votesTokenMasterCopyContract.asSigner.address, encodedSetUpTokenData, tokenNonce],
          0,
          false
        );

        const deployStrategyTx = buildContractCall(
          zodiacModuleProxyFactoryContract.asSigner,
          'deployModule',
          [
            linearVotingMasterCopyContract.asSigner.address,
            encodedStrategySetUpData,
            strategyNonce,
          ],
          0,
          false
        );
        const deployUsulTx = buildContractCall(
          zodiacModuleProxyFactoryContract.asSigner,
          'deployModule',
          [fractalUsulMasterCopyContract.asSigner.address, encodedSetupUsulData, usulNonce],
          0,
          false
        );
        const execInternalSafeTx = buildContractCall(
          safeContract,
          'execTransaction',
          [
            multiSendContract.asSigner.address, // to
            '0', // value
            multiSendContract.asSigner.interface.encodeFunctionData('multiSend', [safeInternalTx]), // calldata
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

        // If childDAO, deploy Fractal Module (after deployUsulTx)
        if (parentDAOAddress) {
          txs.splice(4, 0, deployFractalModuleTx);
        }

        const safeTx = encodeMultiSend(txs);

        return { predictedGnosisSafeAddress, createSafeTx, safeTx };
      };
      return buildTx();
    },
    [
      account,
      gnosisSafeFactoryContract,
      gnosisSafeSingletonContract,
      fractalUsulMasterCopyContract,
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      multiSendContract,
      fractalRegistryContract,
      fractalModuleMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      saltNum,
      signerOrProvider,
      buildDeploySafeTx,
      buildVetoGuardData,
      defaultAbiCoder,
      getCreate2Address,
      solidityKeccak256,
      AddressZero,
      votesTokenMasterCopyContract,
    ]
  );

  const buildDao = useCallback(
    async (
      daoData: TokenGovernanceDAO | GnosisDAO,
      parentDAOAddress?: string,
      parentTokenAddress?: string
    ) => {
      switch (daoData.governance) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          return buildUsulTx(daoData, parentDAOAddress, parentTokenAddress);
        case GovernanceTypes.GNOSIS_SAFE:
          return buildMultisigTx(daoData, parentDAOAddress, parentTokenAddress);
      }
    },
    [buildUsulTx, buildMultisigTx]
  );

  return [buildDao] as const;
};

export default useBuildDAOTx;
