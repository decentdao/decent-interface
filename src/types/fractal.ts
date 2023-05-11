import {
  FractalModule,
  FractalRegistry,
  GnosisSafe,
  GnosisSafeProxyFactory,
  ModuleProxyFactory,
  LinearERC20Voting,
  Azorius,
  AzoriusFreezeGuard,
  ERC20Claim,
  ERC20FreezeVoting,
  MultisigFreezeVoting,
  VotesERC20,
  MultisigFreezeGuard,
  VotesERC20Wrapper,
  KeyValuePairs,
} from '@fractal-framework/fractal-contracts';
import SafeServiceClient, {
  SafeMultisigTransactionWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  EthereumTxWithTransfersResponse,
  SafeBalanceUsdResponse,
  SafeCollectibleResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { Dispatch } from 'react';
import { MultiSend } from '../assets/typechain-types/usul';
import { FractalGovernanceActions } from '../providers/App/governance/action';
import { GovernanceContractActions } from '../providers/App/governanceContracts/action';
import { FractalGuardActions } from '../providers/App/guard/action';
import { GuardContractActions } from '../providers/App/guardContracts/action';
import { TreasuryActions } from '../providers/App/treasury/action';
import { NodeActions } from './../providers/App/node/action';
import { VotesTokenData } from './account';
import { ContractConnection } from './contract';
import { FreezeGuardType, FreezeVotingType } from './daoGovernance';
import {
  ProposalMetaData,
  MultisigProposal,
  AzoriusProposal,
  SnapshotProposal,
} from './daoProposal';
import { TreasuryActivity } from './daoTreasury';
import { AllTransfersListResponse, SafeInfoResponseWithGuard } from './safeGlobal';
import { BNFormattedPair } from './votingFungibleToken';
/**
 * The possible states of a DAO proposal, for both Token Voting (Azorius) and Multisignature
 * (Safe) governance.
 *
 * @note it is required that Azorius-specific states match those on the Azorius contracts,
 * including casing.
 */
export enum FractalProposalState {
  /**
   * Proposal is created and can be voted on.  This is the initial state of all
   * newly created proposals.
   *
   * Azorius / Multisig (all proposals).
   */
  ACTIVE = 'stateActive',

  /**
   * A proposal that passes enters the `TIMELOCKED` state, during which it cannot yet be executed.
   * This is to allow time for token holders to potentially exit their position, as well as parent DAOs
   * time to initiate a freeze, if they choose to do so. A proposal stays timelocked for the duration
   * of its `timelockPeriod`.
   *
   * All Azorius and multisig subDAOs.
   */
  TIMELOCKED = 'stateTimeLocked',

  /**
   * Following the `TIMELOCKED` state, a passed proposal becomes `EXECUTABLE`, and can then finally
   * be executed on chain by anyone.
   *
   * Azorius / Multisig (all proposals).
   */
  EXECUTABLE = 'stateExecutable',

  /**
   * The final state for a passed proposal.  The proposal has been executed on the blockchain.
   *
   * Azorius / Multisig (all proposals).
   */
  EXECUTED = 'stateExecuted',

  /**
   * A passed proposal which is not executed before its `executionPeriod` has elapsed will be `EXPIRED`,
   * and can no longer be executed.
   *
   * Azorius (all) / multisig subDAO.
   */
  EXPIRED = 'stateExpired',

  /**
   * A failed proposal (as defined by its [BaseStrategy](../BaseStrategy.md) `isPassed` function). For a basic strategy,
   * this would mean it received more NO votes than YES or did not achieve quorum.
   *
   * Azorius only.
   */
  FAILED = 'stateFailed',

  /**
   * Proposal fails due to a proposal being executed with the same nonce.
   * A multisig proposal is off-chain, and is signed with a specific nonce.
   * If a proposal with the same nonce is executed, any proposal with the same
   * nonce will be impossible to execute, reguardless of how many signers it has.
   *
   * Multisig only.
   */
  REJECTED = 'stateRejected',

  /**
   * Quorum (or signers) is reached, the proposal can be 'timelocked' for execution.
   * Anyone can move the state from Timelockable to TimeLocked via a transaction.
   *
   * Multisig subDAO only, Azorius DAOs move from ACTIVE to TIMELOCKED automatically.
   */
  TIMELOCKABLE = 'stateTimelockable',

  /**
   * Any Safe is able to have modules attached (e.g. Zodiac), which can act essentially as a backdoor,
   * executing transactions without needing the required signers.
   *
   * Safe Module 'proposals' in this sense are single state proposals that are already executed.
   *
   * This is a rare case, as the Azorius module is shown using Azorius states, but other third party
   * modules could potentially generate this state so we allow for badges to properly label
   * this case in the UI.
   *
   * Third party Safe module transactions only.
   */
  MODULE = 'stateModule',

  // Closed is proposal state specific to Snapshot proposals
  CLOSED = 'stateClosed',
}

export interface IGnosisFreezeGuard {
  freezeVotesThreshold: BigNumber; // Number of freeze votes required to activate a freeze
  freezeProposalCreatedTime: BigNumber; // Block number the freeze proposal was created at
  freezeProposalVoteCount: BigNumber; // Number of accrued freeze votes
  freezeProposalPeriod: BigNumber; // Number of blocks a freeze proposal has to succeed
  freezePeriod: BigNumber; // Number of blocks a freeze lasts, from time of freeze proposal creation
  userHasFreezeVoted: boolean;
  isFrozen: boolean;
  userHasVotes: boolean;
}

export interface GovernanceActivity extends ActivityBase {
  state: FractalProposalState | null;
  proposalId: string;
  targets: string[];
  metaData?: ProposalMetaData;
}

export interface ActivityBase {
  eventDate: Date;
  eventType: ActivityEventType;
  transaction?: ActivityTransactionType;
  transactionHash?: string | null;
}

export type Activity = TreasuryActivity | MultisigProposal | AzoriusProposal | SnapshotProposal;

export type ActivityTransactionType =
  | SafeMultisigTransactionWithTransfersResponse
  | SafeModuleTransactionWithTransfersResponse
  | EthereumTxWithTransfersResponse;

export enum ActivityEventType {
  Treasury,
  Governance,
  Module,
}

export enum SafeTransferType {
  ERC721 = 'ERC721_TRANSFER',
  ERC20 = 'ERC20_TRANSFER',
  ETHER = 'ETHER_TRANSFER',
}

export interface ITokenAccount {
  userBalance: BigNumber | undefined;
  userBalanceString: string | undefined;
  delegatee: string | undefined;
  votingWeight: BigNumber | undefined;
  votingWeightString: string | undefined;
  isDelegatesSet: boolean | undefined;
}

/**
 * @dev This interface represents the store for the Fractal DAO.
 * @param baseContracts - This object contains the base contracts for the Fractal DAO.
 * @param clients - This object contains the clients for the Fractal DAO.
 * @param dispatch - This object contains the dispatch functions for the Fractal DAO.
 */
export interface FractalStore extends Fractal {
  baseContracts: FractalContracts;
  clients: FractalClients;
  action: {
    dispatch: Dispatch<FractalActions>;
    resetDAO: () => Promise<void>;
  };
}
export enum StoreAction {
  RESET = 'RESET',
}
export type FractalActions =
  | { type: StoreAction.RESET }
  | NodeActions
  | FractalGuardActions
  | FractalGovernanceActions
  | TreasuryActions
  | GovernanceContractActions
  | GuardContractActions;
export interface Fractal {
  node: FractalNode;
  guard: FreezeGuard;
  governance: FractalGovernance;
  treasury: FractalTreasury;
  governanceContracts: FractalGovernanceContracts;
  guardContracts: FractalGuardContracts;
  readOnly: ReadOnlyState;
}

export interface FractalClients {
  safeService: SafeServiceClient;
}

export interface FractalGovernanceContracts {
  ozLinearVotingContract: ContractConnection<LinearERC20Voting> | null;
  azoriusContract: ContractConnection<Azorius> | null;
  tokenContract: ContractConnection<VotesERC20 | VotesERC20Wrapper> | null;
  underlyingTokenAddress?: string;
  isLoaded: boolean;
}

export interface FractalNode {
  daoName: string | null;
  daoAddress: string | null;
  safe: SafeInfoResponseWithGuard | null;
  fractalModules: FractalModuleData[];
  nodeHierarchy: NodeHierarchy;
  isModulesLoaded?: boolean;
  daoSnapshotURL?: string;
}

export interface Node extends Omit<FractalNode, 'safe' | 'fractalModules' | 'isModulesLoaded'> {}

export interface FractalModuleData {
  moduleContract: Azorius | FractalModule | undefined;
  moduleAddress: string;
  moduleType: FractalModuleType;
}

export enum FractalModuleType {
  AZORIUS,
  FRACTAL,
  UNKNOWN,
}

export interface FractalGuardContracts {
  freezeGuardContract?: ContractConnection<MultisigFreezeGuard | AzoriusFreezeGuard>;
  freezeVotingContract?: ContractConnection<ERC20FreezeVoting | MultisigFreezeVoting>;
  freezeGuardType: FreezeGuardType | null;
  freezeVotingType: FreezeVotingType | null;
}

export interface FreezeGuard {
  freezeVotesThreshold: BigNumber | null; // Number of freeze votes required to activate a freeze
  freezeProposalCreatedTime: BigNumber | null; // Block number the freeze proposal was created at
  freezeProposalVoteCount: BigNumber | null; // Number of accrued freeze votes
  freezeProposalPeriod: BigNumber | null; // Number of blocks a freeze proposal has to succeed
  freezePeriod: BigNumber | null; // Number of blocks a freeze lasts, from time of freeze proposal creation
  userHasFreezeVoted: boolean;
  isFrozen: boolean;
  userHasVotes: boolean;
}

export interface FractalTreasury {
  assetsFungible: SafeBalanceUsdResponse[];
  assetsNonFungible: SafeCollectibleResponse[];
  transfers?: AllTransfersListResponse;
}
export type FractalGovernance = AzoriusGovernance | SafeMultisigGovernance;
export interface AzoriusGovernance extends Governance {
  votesStrategy: VotesStrategyAzorius;
  votesToken: VotesTokenData;
}
export interface SafeMultisigGovernance extends Governance {}

export interface Governance {
  type?: GovernanceModuleType;
  proposals: FractalProposal[] | null;
  tokenClaimContract?: ERC20Claim;
}

export interface VotesStrategyAzorius extends VotesStrategy {}

export interface VotesStrategy<Type = BNFormattedPair> {
  votingPeriod?: Type;
  quorumPercentage?: Type;
  timeLockPeriod?: Type;
}

export enum GovernanceModuleType {
  MULTISIG = 'labelMultisigGov',
  AZORIUS = 'labelAzoriusGov',
}

export interface NodeHierarchy {
  parentAddress: string | null;
  childNodes: Node[];
}

export interface FractalContracts {
  multiSendContract: ContractConnection<MultiSend>;
  gnosisSafeFactoryContract: ContractConnection<GnosisSafeProxyFactory>;
  fractalAzoriusMasterCopyContract: ContractConnection<Azorius>;
  linearVotingMasterCopyContract: ContractConnection<LinearERC20Voting>;
  gnosisSafeSingletonContract: ContractConnection<GnosisSafe>;
  zodiacModuleProxyFactoryContract: ContractConnection<ModuleProxyFactory>;
  fractalModuleMasterCopyContract: ContractConnection<FractalModule>;
  fractalRegistryContract: ContractConnection<FractalRegistry>;
  multisigFreezeGuardMasterCopyContract: ContractConnection<MultisigFreezeGuard>;
  azoriusFreezeGuardMasterCopyContract: ContractConnection<AzoriusFreezeGuard>;
  freezeMultisigVotingMasterCopyContract: ContractConnection<MultisigFreezeVoting>;
  freezeERC20VotingMasterCopyContract: ContractConnection<ERC20FreezeVoting>;
  votesTokenMasterCopyContract: ContractConnection<VotesERC20>;
  claimingMasterCopyContract: ContractConnection<ERC20Claim>;
  votesERC20WrapperMasterCopyContract: ContractConnection<VotesERC20Wrapper>;
  keyValuePairsContract: ContractConnection<KeyValuePairs>;
}

export type FractalProposal = AzoriusProposal | MultisigProposal | SnapshotProposal;

/**
 * Immutable state generally calculated from other stateful objects.
 * These are front end specific values that are commonly used throughout
 * the app.
 */
export interface ReadOnlyState {
  /** The currently connected DAO or null if there isn't one. */
  dao: ReadOnlyDAO | null;
  /** The "user", meaning the app user, wallet connected or not. */
  user: ReadOnlyUser;
}

export interface ReadOnlyUser {
  /** The user's wallet address, if connected.  */
  address?: string;
  /** The number of delegated tokens for the connected Azorius DAO, 1 for a Multisig DAO signer */
  votingWeight: BigNumber;
}

export interface ReadOnlyDAO {
  /** Whether the connected DAO is an Azorius DAO.  */
  isAzorius: boolean;
}
