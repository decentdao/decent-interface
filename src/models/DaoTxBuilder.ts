import {
  FractalUsul__factory,
  GnosisSafe,
  OZLinearVoting__factory,
  VetoERC20Voting__factory,
} from '@fractal-framework/fractal-contracts';
import { BigNumber, ethers } from 'ethers';
import { GnosisDAO, SubDAO, TokenGovernanceDAO } from '../components/DaoCreator/provider/types';
import { buildContractCall, encodeMultiSend, getRandomBytes } from '../helpers';
import { fractalModuleData, FractalModuleData } from '../helpers/BuildDAOTx/fractalModuleData';
import { TIMER_MULT } from '../helpers/BuildDAOTx/utils';
import { vetoGuardDataUsul } from '../helpers/BuildDAOTx/vetoGuardData';
import { vetoVotesData } from '../helpers/BuildDAOTx/vetoVotesData';
import { SafeTransaction } from '../types';
import { BaseContracts, UsulContracts } from './types/contracts';
import { getCreate2Address, solidityKeccak256, defaultAbiCoder } from "ethers/lib/utils";
import { TxBuilderFactory } from "./TxBuilderFactory";

const { AddressZero } = ethers.constants;

export class DaoTxBuilder {
  private baseContracts: BaseContracts;
  private readonly usulContracts: UsulContracts | undefined;
  private readonly daoData: GnosisDAO | TokenGovernanceDAO;
  private readonly signerOrProvider: ethers.Signer | any;
  private readonly parentDAOAddress?: string;
  private readonly parentTokenAddress?: string;
  private txBuilderFactory: TxBuilderFactory;

  // Salt used to generate transactions
  private readonly saltNum;

  // Gnosis Safe Data
  private predictedGnosisSafeAddress: string;
  private createSafeTx: SafeTransaction;
  private safeContract: GnosisSafe;

  // Fractal Module
  private enableFractalModuleTx: SafeTransaction | undefined;
  private deployFractalModuleTx: SafeTransaction | undefined;

  // Internal Txs
  private internalTxs: SafeTransaction[] = [];

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    usulContracts: UsulContracts | undefined,
    daoData: GnosisDAO | TokenGovernanceDAO,
    saltNum: string,
    predictedGnosisSafeAddress: string,
    createSafeTx: SafeTransaction,
    safeContract: GnosisSafe,
    txBuilderFactory: TxBuilderFactory,
    parentDAOAddress?: string,
    parentTokenAddress?: string
  ) {
    this.signerOrProvider = signerOrProvider;
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.usulContracts = usulContracts;
    this.predictedGnosisSafeAddress = predictedGnosisSafeAddress;
    this.createSafeTx = createSafeTx;
    this.safeContract = safeContract;
    this.parentDAOAddress = parentDAOAddress;
    this.parentTokenAddress = parentTokenAddress;
    this.txBuilderFactory = txBuilderFactory;
    this.saltNum = saltNum;
  }

  public setupFractalModuleData(): void {
    const { enableFractalModuleTx, deployFractalModuleTx }: FractalModuleData =
      fractalModuleData(
        this.baseContracts.fractalModuleMasterCopyContract,
        this.baseContracts.zodiacModuleProxyFactoryContract,
        this.safeContract!,
        this.saltNum,
        this.parentDAOAddress
      );

    this.enableFractalModuleTx = enableFractalModuleTx;
    this.deployFractalModuleTx = deployFractalModuleTx;
  }

  public async buildUsulTx(): Promise<string> {
    const gnosisDaoData = this.daoData as GnosisDAO;
    const tokenGovernanceDaoData = this.daoData as TokenGovernanceDAO;

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
      tokenAllocationsOwners.push(this.predictedGnosisSafeAddress!);
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
      this.usulContracts!.votesTokenMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitTokenData,
      ]);
    const tokenByteCodeLinear =
      '0x602d8060093d393df3363d3d373d3d3d363d73' +
      this.usulContracts!.votesTokenMasterCopyContract.address.slice(2) +
      '5af43d82803e903d91602b57fd5bf3';
    const tokenNonce = getRandomBytes();
    const tokenSalt = solidityKeccak256(
      ['bytes32', 'uint256'],
      [solidityKeccak256(['bytes'], [encodedSetUpTokenData]), tokenNonce]
    );
    const predictedTokenAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      tokenSalt,
      solidityKeccak256(['bytes'], [tokenByteCodeLinear])
    );

    const encodedStrategyInitParams = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
      [
        this.predictedGnosisSafeAddress, // owner
        predictedTokenAddress,
        '0x0000000000000000000000000000000000000001',
        tokenGovernanceDaoData.votingPeriod.mul(TIMER_MULT),
        tokenGovernanceDaoData.quorumPercentage,
        tokenGovernanceDaoData.timelock.mul(TIMER_MULT),
        'linearVoting',
      ]
    );

    const encodedStrategySetUpData =
      this.usulContracts!.linearVotingMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedStrategyInitParams,
      ]);
    const strategyByteCodeLinear =
      '0x602d8060093d393df3363d3d373d3d3d363d73' +
      this.usulContracts!.linearVotingMasterCopyContract.address.slice(2) +
      '5af43d82803e903d91602b57fd5bf3';
    const strategyNonce = getRandomBytes();
    const strategySalt = solidityKeccak256(
      ['bytes32', 'uint256'],
      [solidityKeccak256(['bytes'], [encodedStrategySetUpData]), strategyNonce]
    );
    const predictedStrategyAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      strategySalt,
      solidityKeccak256(['bytes'], [strategyByteCodeLinear])
    );

    const encodedInitUsulData = defaultAbiCoder.encode(
      ['address', 'address', 'address', 'address[]'],
      [
        this.predictedGnosisSafeAddress,
        this.predictedGnosisSafeAddress,
        this.predictedGnosisSafeAddress,
        [predictedStrategyAddress],
      ]
    );
    const encodedSetupUsulData =
      this.usulContracts!.fractalUsulMasterCopyContract.interface.encodeFunctionData('setUp', [
        encodedInitUsulData,
      ]);

    const usulByteCodeLinear =
      '0x602d8060093d393df3363d3d373d3d3d363d73' +
      this.usulContracts!.fractalUsulMasterCopyContract.address.slice(2) +
      '5af43d82803e903d91602b57fd5bf3';
    const usulNonce = getRandomBytes();
    const usulSalt = solidityKeccak256(
      ['bytes32', 'uint256'],
      [solidityKeccak256(['bytes'], [encodedSetupUsulData]), usulNonce]
    );
    const predictedUsulAddress = getCreate2Address(
      this.baseContracts.zodiacModuleProxyFactoryContract.address,
      usulSalt,
      solidityKeccak256(['bytes'], [usulByteCodeLinear])
    );

    const signatures =
      '0x000000000000000000000000' +
      this.baseContracts.multiSendContract.address.slice(2) +
      '0000000000000000000000000000000000000000000000000000000000000000' +
      '01';

    const usulContract = FractalUsul__factory.connect(predictedUsulAddress, this.signerOrProvider);
    const linearVotingContract = OZLinearVoting__factory.connect(
      predictedStrategyAddress,
      this.signerOrProvider
    );

    this.internalTxs = [
      buildContractCall(
        this.baseContracts.fractalRegistryContract,
        'updateDAOName',
        [gnosisDaoData.daoName],
        0,
        false
      ),
      buildContractCall(linearVotingContract, 'setUsul', [usulContract.address], 0, false),
      buildContractCall(this.safeContract!, 'enableModule', [usulContract.address], 0, false)
    ];

    if (this.parentDAOAddress) {
      const subDAOData = this.daoData as SubDAO;

      // Veto Votes
      const { vetoVotingAddress, setVetoVotingCalldata, vetoVotesType } = vetoVotesData(
        this.baseContracts.vetoERC20VotingMasterCopyContract,
        this.baseContracts.vetoMultisigVotingMasterCopyContract,
        this.baseContracts.zodiacModuleProxyFactoryContract,
        this.saltNum,
        this.parentTokenAddress
      );

      // Veto Guard
      const { predictedVetoModuleAddress, deployVetoGuardTx } = vetoGuardDataUsul(
        this.usulContracts!.usulVetoGuardMasterCopyContract,
        this.baseContracts.zodiacModuleProxyFactoryContract,
        subDAOData.executionPeriod,
        this.parentDAOAddress,
        vetoVotingAddress,
        this.safeContract!.address,
        this.saltNum,
        predictedUsulAddress,
        predictedStrategyAddress
      );

      this.internalTxs.concat([
        // Enable Fractal Module
        this.enableFractalModuleTx!,
        // Deploy Veto Voting
        buildContractCall(
          this.baseContracts.zodiacModuleProxyFactoryContract,
          'deployModule',
          [
            vetoVotesType === VetoERC20Voting__factory
              ? this.baseContracts.vetoERC20VotingMasterCopyContract.address
              : this.baseContracts.vetoMultisigVotingMasterCopyContract.address,
            setVetoVotingCalldata,
            this.saltNum,
          ],
          0,
          false
        ),
        // Setup Veto Voting
        buildContractCall(
          vetoVotesType.connect(vetoVotingAddress, this.signerOrProvider),
          'setUp',
          [
            ethers.utils.defaultAbiCoder.encode(
              ['address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
              [
                this.parentDAOAddress, // Owner -- Parent DAO
                subDAOData.vetoVotesThreshold, // VetoVotesThreshold
                subDAOData.freezeVotesThreshold, // FreezeVotesThreshold
                subDAOData.freezeProposalPeriod.mul(TIMER_MULT), // FreezeProposalPeriod
                subDAOData.freezePeriod.mul(TIMER_MULT), // FreezePeriod
                this.parentTokenAddress ?? this.parentDAOAddress, // ParentGnosisSafe or Votes Token
                predictedVetoModuleAddress, // VetoGuard
              ]
            ),
          ],
          0,
          false
        ),

        // Deploy Veto Guard
        deployVetoGuardTx,
        // Enable Veto Guard
        buildContractCall(usulContract, 'setGuard', [predictedVetoModuleAddress], 0, false)
      ]);
    }

    this.internalTxs.concat([
      // Add Usul Contract as the Safe owner
      buildContractCall(
        this.safeContract!,
        'addOwnerWithThreshold',
        [usulContract.address, 1],
        0,
        false
      ),
      // Remove Multisend contract
      buildContractCall(
        this.safeContract!,
        'removeOwner',
        [usulContract.address, this.baseContracts.multiSendContract.address, 1],
        0,
        false
      )
    ]);

    const safeInternalTx = encodeMultiSend(this.internalTxs);

    const createTokenTx = buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [this.usulContracts!.votesTokenMasterCopyContract.address, encodedSetUpTokenData, tokenNonce],
      0,
      false
    );

    const deployStrategyTx = buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [
        this.usulContracts!.linearVotingMasterCopyContract.address,
        encodedStrategySetUpData,
        strategyNonce,
      ],
      0,
      false
    );
    const deployUsulTx = buildContractCall(
      this.baseContracts.zodiacModuleProxyFactoryContract,
      'deployModule',
      [this.usulContracts!.fractalUsulMasterCopyContract.address, encodedSetupUsulData, usulNonce],
      0,
      false
    );
    const execInternalSafeTx = buildContractCall(
      this.safeContract!,
      'execTransaction',
      [
        this.baseContracts.multiSendContract.address, // to
        '0', // value
        this.baseContracts.multiSendContract.interface.encodeFunctionData('multiSend', [safeInternalTx]), // calldata
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

    const txs: SafeTransaction[] = [
      this.createSafeTx!,
      createTokenTx,
      deployStrategyTx,
      deployUsulTx,
      execInternalSafeTx,
    ];

    // If childDAO, deploy Fractal Module (after deployUsulTx)
    if (this.parentDAOAddress) {
      txs.splice(4, 0, this.deployFractalModuleTx!);
    }

    return encodeMultiSend(txs);
  }

  public async buildMultisigTx(): Promise<string> {
    const multisigTxBuilder = this.txBuilderFactory.createMultiSigTxBuilder();

    this.internalTxs.push(this.buildUpdateDAONameTx());

    if (this.parentDAOAddress) {
      const vetoGuardTxBuilder = this.txBuilderFactory.createVetoGuardTxBuilder();

      this.internalTxs.concat([
        // Enable Fractal Module b/c this DAO has a parent
        this.enableFractalModuleTx!,
        vetoGuardTxBuilder.buildDeployZodiacModuleTx(),
        vetoGuardTxBuilder.buildVetoVotingSetupTx(this.signerOrProvider),
        vetoGuardTxBuilder.buildDeployVetoGuardTx(),
        vetoGuardTxBuilder.buildSetGuardTx()
      ]);
    }

    // Remove Multisend Contract as owner
    this.internalTxs.push(multisigTxBuilder.buildRemoveMultiSendOwnerTx());

    const txs: SafeTransaction[] = [
      this.createSafeTx!,
      this.buildExecInternalSafeTx(multisigTxBuilder.signatures())
    ];

    // If childDAO, deploy Fractal Module
    if (this.parentDAOAddress) {
      txs.splice(1, 0, this.deployFractalModuleTx!);
    }

    return encodeMultiSend(txs);
  }

  private buildUpdateDAONameTx(): SafeTransaction {
    return buildContractCall(
      this.baseContracts.fractalRegistryContract,
      'updateDAOName',
      [this.daoData.daoName],
      0,
      false
    )
  }

  private buildExecInternalSafeTx(signatures: string): SafeTransaction {
    const safeInternalTx = encodeMultiSend(this.internalTxs);
    return buildContractCall(
      this.safeContract!,
      'execTransaction',
      [
        this.baseContracts.multiSendContract.address, // to
        '0', // value
        this.baseContracts.multiSendContract.interface.encodeFunctionData('multiSend', [
          safeInternalTx,
        ]), // calldata
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
  }

  isUsul(): boolean {
    return !!this.usulContracts;
  }
}
