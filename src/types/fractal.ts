import {
  FractalUsul,
  FractalModule,
  OZLinearVoting,
  VotesToken,
} from '@fractal-framework/fractal-contracts';
import SafeServiceClient, {
  AllTransactionsListResponse,
  SafeMultisigTransactionWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  EthereumTxWithTransfersResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { IConnectedAccount } from './account';
import { TreasuryActions, GovernanceActions, GnosisActions } from './actions';
import { ContractConnection } from './contract';
import { CreateDAOFunc } from './createDAO';
import { GovernanceTypes } from './daoGovernance';
import { IGnosisVetoContract } from './daoGuard';
import {
  CreateProposalFunc,
  TxProposalsInfo,
  ProposalMetaData,
  MultisigProposal,
  UsulProposal,
} from './daoProposal';
import { ITreasury, TreasuryActivity } from './daoTreasury';
import { SafeInfoResponseWithGuard } from './safeGlobal';
import { IGoveranceTokenData } from './votingFungibleToken';

export enum GnosisModuleType {
  USUL,
  FRACTAL,
  UNKNOWN,
}

export interface IFractalContext {
  gnosis: IGnosis;
  treasury: ITreasury;
  governance: IGovernance;
  account: IConnectedAccount;
  dispatches: {
    treasuryDispatch: React.Dispatch<TreasuryActions>;
    governanceDispatch: React.Dispatch<GovernanceActions>;
    gnosisDispatch: React.Dispatch<GnosisActions>;
  };
  actions: {
    refreshSafeData: () => Promise<void>;
    lookupModules: (_moduleAddresses: string[]) => Promise<IGnosisModuleData[] | undefined>;
    getVetoGuardContracts: (
      _guardAddress: string,
      _modules?: IGnosisModuleData[] | undefined
    ) => Promise<IGnosisVetoContract | undefined>;
    lookupFreezeData: (
      _vetoGuardContracts: IGnosisVetoContract
    ) => Promise<IGnosisFreezeData | undefined>;
  };
}

export interface IGnosis {
  providedSafeAddress?: string;
  daoName: string;
  safeService?: SafeServiceClient;
  safe: Partial<SafeInfoResponseWithGuard>;
  modules: IGnosisModuleData[];
  guardContracts: IGnosisVetoContract;
  freezeData: IGnosisFreezeData | undefined;
  transactions: AllTransactionsListResponse;
  isGnosisLoading: boolean;
  isNodesLoaded: boolean;
  parentDAOAddress?: string;
}

export interface IGovernance {
  actions: {
    createProposal?: {
      func: CreateProposalFunc;
      pending: boolean;
    };
    createSubDAO?: {
      func: CreateDAOFunc;
      pending: boolean;
    };
  };
  type: GovernanceTypes | null;
  txProposalsInfo: TxProposalsInfo;
  governanceToken?: IGoveranceTokenData;
  contracts: GovernanceContracts;
  governanceIsLoading: boolean;
}

export interface IGnosisModuleData {
  moduleContract: FractalUsul | FractalModule | undefined;
  moduleAddress: string;
  moduleType: GnosisModuleType;
}

export interface GovernanceContracts {
  ozLinearVotingContract?: ContractConnection<OZLinearVoting>;
  usulContract?: ContractConnection<FractalUsul>;
  tokenContract?: ContractConnection<VotesToken>;
  contractsIsLoading: boolean;
}

/**
 * The possible states of a DAO proposal, both Token Voting (Usul) and Multisignature
 * governance.
 *
 * @note it is required that Usul-specific states match those on the Usul contracts:
 * https://github.com/SekerDAO/Usul/blob/0cb39c0dd941b2825d401de69d16d41138a26717/contracts/Usul.sol#L23
 *
 * Although in some cases (documented below), what we show to the user may be different.
 */
export enum TxProposalState {
  /**
   * Proposal is created and can be voted on.  This is the initial state of all
   * newly created proposals.
   *
   * Usul / Multisig (all proposals).
   */
  Active = 'stateActive',

  /**
   * This state occurs when the 'cancelProposals' function is called on the Usul contract:
   * https://github.com/SekerDAO/Usul/blob/0cb39c0dd941b2825d401de69d16d41138a26717/contracts/Usul.sol#L237
   *
   * @note We do not support this function in the UI and it is difficult to achieve this state
   * given our current setup, but still possible, so we allow for the proper badge to be shown.
   *
   * Usul only.
   */
  Canceled = 'stateCanceled',

  /**
   * Similar to 'Queued' state for a multisig child, but applies to all Usul based
   * DAOs.  The proposal cannot yet be executed, until the timelock period has elapsed.
   *
   * In addition to allowing for the possiblity to freeze, this state also allows token
   * holders to exit their shares, if they would like to, before the execution of a transaction
   * they disagree with.
   *
   * @note 'TimeLocked' is the state that Usul calls this period, however for consistency in
   * the Fractal UI, we display this state as 'Queued', the same as multisig subDAOs.
   *
   * Usul only.
   */
  TimeLocked = 'stateTimeLocked',

  /**
   * The proposal has been executed.
   *
   * Usul / Multisig (all proposals).
   */
  Executed = 'stateExecuted',

  /**
   * The queue/timelock period has ended and the proposal is able to be executed.
   * Once in this state, the execution period starts, after which if the proposal
   * has not been executed, it will become Expired.
   *
   * @note Usul calls this state 'Executing', however from our UI we display it as 'Executable', to
   * be more clear to the user that it is an actionable state.
   *
   * Anyone can execute an Executable proposal.
   *
   * Usul / Multisig (all proposals).
   */
  Executing = 'stateExecuting',

  /**
   * This state occurs when a proposal does not have a voting strategy associated with it:
   * https://github.com/SekerDAO/Usul/blob/0cb39c0dd941b2825d401de69d16d41138a26717/contracts/Usul.sol#L362
   *
   * @note It is technically possible to achieve this state if a Usul mod is attached without a voting
   * strategy outside our own UI, so we allow for the proper badge to be shown in this case.
   *
   * Usul only.
   */
  Uninitialized = 'stateUninitialized',

  /**
   * Quorum (or signers) is reached, the proposal can be queued for execution.
   * Anyone can move the state from Queueable to Queued/TimeLocked via a transaction.
   *
   * Usul / Multisig subDAO only.
   */
  Queueable = 'stateQueueable',

  /**
   * The proposal is 'queued', during which the proposal cannot yet be executed.
   * This period is intended to allow for the ability of the parent to freeze
   * the DAO, to prevent a transaction from occurring, if they would like.
   *
   * Multisig subDAO Only.
   */
  Queued = 'stateQueued',

  /**
   * Quorum AND/OR less than 50% approval not reached within the voting period.
   *
   * Usul only.
   */
  Failed = 'stateFailed',

  /**
   * Proposal is not executed before the execution period ends following
   * the Executing (e.g. executable) state.
   *
   * Usul (all) / multisig subDAO.
   */
  Expired = 'stateExpired',

  /**
   * Proposal fails due to a proposal being executed with the same nonce.
   * A multisig proposal is off-chain, and is signed with a specific nonce.
   * If a proposal with the same nonce is executed, any proposal with the same
   * nonce will be impossible to execute, reguardless of how many signers it has.
   *
   * Multisig only.
   */
  Rejected = 'stateRejected',

  /**
   * Any Safe is able to have modules attached (e.g. Zodiac), which can act essentially as a backdoor,
   * executing transactions without needing the required signers.
   *
   * Safe Module 'proposals' in this sense are single state proposals that are already executed.
   *
   * This is a rare case, as the Usul module is shown using Usul states, but other third party
   * modules could potentially generate this state so we allow for badges to properly label
   * this case in the UI.
   *
   * Third party Safe module transactions only.
   */
  Module = 'stateModule',
}

export interface IGnosisFreezeData {
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
  state: TxProposalState | null;
  proposalNumber: string;
  targets: string[];
  metaData?: ProposalMetaData;
}
export interface ActivityBase {
  eventDate: Date;
  eventType: ActivityEventType;
  transaction?: ActivityTransactionType;
  transactionHash?: string | null;
}

export type Activity = TreasuryActivity | MultisigProposal | UsulProposal;

export type ActivityTransactionType =
  | SafeMultisigTransactionWithTransfersResponse
  | SafeModuleTransactionWithTransfersResponse
  | EthereumTxWithTransfersResponse;

export enum ActivityEventType {
  Treasury,
  Governance,
  Module,
}

export enum GnosisTransferType {
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
