import {
  Azorius,
  LinearERC20Voting,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import {
  ProposalCreatedEvent,
  ProposalExecutedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent as ERC20VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { VotedEvent as ERC721VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import { strategyFractalProposalStates } from '../constants/strategy';
import { logError } from '../helpers/errorLogging';
import {
  FractalProposalState,
  ProposalVotesSummary,
  ProposalVote,
  ProposalData,
  AzoriusProposal,
  ActivityEventType,
  Parameter,
  DataDecoded,
  FractalModuleData,
  FractalModuleType,
  DecodedTransaction,
  VotingStrategyType,
  ERC721ProposalVote,
  MetaTransaction,
  getVoteChoice,
} from '../types';
import { Providers } from '../types/network';
import { getTimeStamp } from './contract';

export const getAzoriusProposalState = async (
  azoriusContract: Azorius,
  proposalId: bigint,
): Promise<FractalProposalState> => {
  const state = await azoriusContract.proposalState(proposalId);
  return strategyFractalProposalStates[state];
};

const getQuorum = async (
  erc20StrategyContract: LinearERC20Voting | undefined,
  erc721StrategyContract: LinearERC721Voting | undefined,
  strategyType: VotingStrategyType,
  proposalId: bigint,
) => {
  let quorum;

  if (strategyType === VotingStrategyType.LINEAR_ERC20 && erc20StrategyContract) {
    quorum = (await erc20StrategyContract.quorumVotes(proposalId)).toBigInt();
  } else if (strategyType === VotingStrategyType.LINEAR_ERC721 && erc721StrategyContract) {
    quorum = (await erc721StrategyContract.quorumThreshold()).toBigInt();
  } else {
    quorum = 0n;
  }

  return quorum;
};

export const getProposalVotesSummary = async (
  erc20Strategy: LinearERC20Voting | undefined,
  erc721Strategy: LinearERC721Voting | undefined,
  strategyType: VotingStrategyType,
  proposalId: bigint,
): Promise<ProposalVotesSummary> => {
  try {
    if (erc20Strategy !== undefined && erc721Strategy !== undefined) {
      logError("we don't support multiple strategy contracts");
      throw new Error("we don't support multiple strategy contracts");
    }

    if (erc20Strategy !== undefined) {
      const { yesVotes, noVotes, abstainVotes } = await erc20Strategy.getProposalVotes(proposalId);

      return {
        yes: yesVotes.toBigInt(),
        no: noVotes.toBigInt(),
        abstain: abstainVotes.toBigInt(),
        quorum: await getQuorum(erc20Strategy, erc721Strategy, strategyType, proposalId),
      };
    } else if (erc721Strategy !== undefined) {
      const { yesVotes, noVotes, abstainVotes } = await erc721Strategy.getProposalVotes(proposalId);

      return {
        yes: yesVotes.toBigInt(),
        no: noVotes.toBigInt(),
        abstain: abstainVotes.toBigInt(),
        quorum: await getQuorum(erc20Strategy, erc721Strategy, strategyType, proposalId),
      };
    } else {
      return {
        yes: 0n,
        no: 0n,
        abstain: 0n,
        quorum: 0n,
      };
    }
  } catch (e) {
    // Sometimes loading DAO proposals called in the moment when proposal was **just** created
    // Thus, calling `getProposalVotes` for such a proposal reverts with error
    // This helps to prevent such case, while event listeners still should get proper data
    logError('Error while retrieving Azorius proposal votes', e);
    return {
      yes: 0n,
      no: 0n,
      abstain: 0n,
      quorum: 0n,
    };
  }
};

const getProposalVotes = (
  erc20VotedEvents: ERC20VotedEvent[] | undefined,
  erc721VotedEvents: ERC721VotedEvent[] | undefined,
  proposalId: bigint,
): (ProposalVote | ERC721ProposalVote)[] => {
  if (erc20VotedEvents !== undefined && erc721VotedEvents !== undefined) {
    logError("two voting contracts? we don't support that.");
    return [];
  }

  if (erc20VotedEvents !== undefined) {
    const erc20ProposalVoteEvents = erc20VotedEvents.filter(
      voteEvent => proposalId === BigInt(voteEvent.args.proposalId),
    );

    return erc20ProposalVoteEvents.map(({ args: { voter, voteType, weight, ...rest } }) => ({
      ...rest,
      weight: weight.toBigInt(),
      voter,
      choice: getVoteChoice(voteType),
    }));
  } else if (erc721VotedEvents !== undefined) {
    const erc721ProposalVoteEvents = erc721VotedEvents.filter(
      voteEvent => proposalId === BigInt(voteEvent.args.proposalId),
    );

    return erc721ProposalVoteEvents.map(({ args: { voter, voteType, tokenIds, ...rest } }) => ({
      ...rest,
      voter,
      choice: getVoteChoice(voteType),
      weight: 1n,
      tokenIds: tokenIds.map(id => id.toString()),
    }));
  }

  return [];
};

export const mapProposalCreatedEventToProposal = async (
  createdEvent: ProposalCreatedEvent,
  erc20StrategyContract: LinearERC20Voting | undefined,
  erc721StrategyContract: LinearERC721Voting | undefined,
  strategyType: VotingStrategyType,
  proposalId: bigint,
  proposer: string,
  azoriusContract: Azorius,
  provider: Providers,
  erc20VotedEvents: Promise<ERC20VotedEvent[] | undefined>,
  erc721VotedEvents: Promise<ERC721VotedEvent[] | undefined>,
  executedEvents: Promise<ProposalExecutedEvent[] | undefined>,
  data?: ProposalData,
) => {
  if (erc20StrategyContract !== undefined && erc721StrategyContract !== undefined) {
    logError("we don't support multiple strategy contracts");
    throw new Error("we don't support multiple strategy contracts");
  }

  let proposalVotes = {
    startBlock: 0,
    endBlock: 0,
    noVotes: 0n,
    yesVotes: 0n,
    abstainVotes: 0n,
  };

  let stratProposalVotes;
  if (erc20StrategyContract !== undefined) {
    stratProposalVotes = await erc20StrategyContract.getProposalVotes(proposalId);
  } else if (erc721StrategyContract !== undefined) {
    stratProposalVotes = await erc721StrategyContract.getProposalVotes(proposalId);
  } else {
    logError('we need a strat!');
    throw new Error('we need a strategy!');
  }

  proposalVotes.startBlock = stratProposalVotes.startBlock;
  proposalVotes.endBlock = stratProposalVotes.endBlock;
  proposalVotes.noVotes = stratProposalVotes.noVotes.toBigInt();
  proposalVotes.yesVotes = stratProposalVotes.yesVotes.toBigInt();
  proposalVotes.abstainVotes = stratProposalVotes.abstainVotes.toBigInt();

  const quorum = await getQuorum(
    erc20StrategyContract,
    erc721StrategyContract,
    strategyType,
    proposalId,
  );

  const deadlineSeconds = await getTimeStamp(proposalVotes.endBlock, provider);
  const block = await provider.getBlock(proposalVotes.startBlock);

  const state = await getAzoriusProposalState(azoriusContract, proposalId);
  const votes = getProposalVotes(await erc20VotedEvents, await erc721VotedEvents, proposalId);

  const votesSummary = {
    yes: proposalVotes.yesVotes,
    no: proposalVotes.noVotes,
    abstain: proposalVotes.abstainVotes,
    quorum,
  };

  const targets = data ? data.decodedTransactions.map(tx => tx.target) : [];

  let transactionHash: string | undefined;
  if (state === FractalProposalState.EXECUTED) {
    const executedEvent = (await executedEvents)?.find(
      event => BigInt(event.args[0]) === proposalId,
    );

    if (!executedEvent) {
      throw new Error('Proposal state is EXECUTED, but no event found');
    }

    transactionHash = executedEvent.transactionHash;
  } else {
    transactionHash = createdEvent.transactionHash;
  }

  const proposal: AzoriusProposal = {
    eventType: ActivityEventType.Governance,
    eventDate: new Date(block.timestamp * 1000),
    proposalId: proposalId.toString(),
    targets,
    proposer,
    startBlock: BigInt(proposalVotes.startBlock),
    transactionHash,
    deadlineMs: deadlineSeconds * 1000,
    state,
    votes,
    votesSummary,
    data,
  };

  return proposal;
};

export const parseMultiSendTransactions = (
  eventTransactionMap: Map<number, any>,
  parameters?: Parameter[],
) => {
  if (!parameters || !parameters.length) {
    return;
  }
  parameters.forEach((param: Parameter) => {
    const valueDecoded = param.valueDecoded;
    if (Array.isArray(valueDecoded)) {
      valueDecoded.forEach(value => {
        const decodedTransaction = {
          target: value.to,
          value: value.value, // This is the ETH value
          function: value.dataDecoded?.method,
          parameterTypes:
            !!value.dataDecoded && value.dataDecoded.parameters
              ? value.dataDecoded.parameters.map(p => p.type)
              : [],
          parameterValues:
            !!value.dataDecoded && value.dataDecoded.parameters
              ? value.dataDecoded.parameters.map(p => p.value)
              : [],
        };
        eventTransactionMap.set(eventTransactionMap.size, {
          ...decodedTransaction,
        });
        if (value.dataDecoded?.parameters && value.dataDecoded?.parameters?.length) {
          return parseMultiSendTransactions(eventTransactionMap, value.dataDecoded.parameters);
        }
      });
    }
  });
};

export const parseDecodedData = (
  multiSigTransaction: SafeMultisigTransactionResponse,
  isMultiSigTransaction: boolean,
): DecodedTransaction[] => {
  const eventTransactionMap = new Map<number, any>();
  const dataDecoded = multiSigTransaction.dataDecoded as any as DataDecoded;
  if (dataDecoded && isMultiSigTransaction) {
    const decodedTransaction: DecodedTransaction = {
      target: multiSigTransaction.to,
      value: multiSigTransaction.value,
      function: dataDecoded.method,
      parameterTypes: dataDecoded.parameters ? dataDecoded.parameters.map(p => p.type) : [],
      parameterValues: dataDecoded.parameters
        ? dataDecoded.parameters.map(p => p.value.toString())
        : [],
    };
    eventTransactionMap.set(eventTransactionMap.size, {
      ...decodedTransaction,
    });
    parseMultiSendTransactions(eventTransactionMap, dataDecoded.parameters);
  }
  return Array.from(eventTransactionMap.values());
};

export function getAzoriusModuleFromModules(modules: FractalModuleData[]) {
  return modules.find(module => module.moduleType === FractalModuleType.AZORIUS);
}

export const decodeTransactions = async (
  _decode: (value: string, to: string, data?: string | undefined) => Promise<DecodedTransaction[]>,
  _transactions: MetaTransaction[],
) => {
  const decodedTransactions = await Promise.all(
    _transactions.map(async tx => _decode(tx.value.toString(), tx.to, tx.data)),
  );
  return decodedTransactions.flat();
};
