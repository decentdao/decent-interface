import {
  Azorius,
  LinearERC20Voting,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import { ProposalExecutedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent as ERC20VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { VotedEvent as ERC721VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { strategyFractalProposalStates } from '../constants/strategy';

import { logError } from '../helpers/errorLogging';
import {
  FractalProposalState,
  ProposalVotesSummary,
  ProposalVote,
  VOTE_CHOICES,
  ProposalData,
  AzoriusProposal,
  ActivityEventType,
  Parameter,
  SafeMultisigTransactionResponse,
  DataDecoded,
  FractalModuleData,
  FractalModuleType,
  DecodedTransaction,
  VotingStrategyType,
  ERC721ProposalVote,
} from '../types';
import { Providers } from '../types/network';
import { getTimeStamp } from './contract';

export const getAzoriusProposalState = async (
  azoriusContract: Azorius,
  proposalId: BigNumber,
): Promise<FractalProposalState> => {
  const state = await azoriusContract.proposalState(proposalId);
  return strategyFractalProposalStates[state];
};

const getQuorum = async (
  erc20StrategyContract: LinearERC20Voting | undefined,
  erc721StrategyContract: LinearERC721Voting | undefined,
  strategyType: VotingStrategyType,
  proposalId: BigNumber,
) => {
  let quorum;

  if (strategyType === VotingStrategyType.LINEAR_ERC20 && erc20StrategyContract) {
    try {
      quorum = await erc20StrategyContract.quorumVotes(proposalId);
    } catch (e) {
      // For who knows reason - strategy.quorumVotes might give you an error
      // Seems like occuring when token deployment haven't worked properly
      logError('Error while getting strategy quorum', e);
      quorum = BigNumber.from(0);
    }
  } else if (strategyType === VotingStrategyType.LINEAR_ERC721 && erc721StrategyContract) {
    quorum = await erc721StrategyContract.quorumThreshold();
  } else {
    quorum = BigNumber.from(0);
  }

  return quorum;
};

export const getProposalVotesSummary = async (
  erc20Strategy: LinearERC20Voting | undefined,
  erc721Strategy: LinearERC721Voting | undefined,
  strategyType: VotingStrategyType,
  proposalId: BigNumber,
): Promise<ProposalVotesSummary> => {
  try {
    if (erc20Strategy !== undefined && erc721Strategy !== undefined) {
      logError("we don't support multiple strategy contracts");
      throw new Error("we don't support multiple strategy contracts");
    }

    if (erc20Strategy !== undefined) {
      const { yesVotes, noVotes, abstainVotes } = await erc20Strategy.getProposalVotes(proposalId);

      return {
        yes: yesVotes,
        no: noVotes,
        abstain: abstainVotes,
        quorum: await getQuorum(erc20Strategy, erc721Strategy, strategyType, proposalId),
      };
    } else if (erc721Strategy !== undefined) {
      const { yesVotes, noVotes, abstainVotes } = await erc721Strategy.getProposalVotes(proposalId);

      return {
        yes: yesVotes,
        no: noVotes,
        abstain: abstainVotes,
        quorum: await getQuorum(erc20Strategy, erc721Strategy, strategyType, proposalId),
      };
    } else {
      const zero = BigNumber.from(0);
      return {
        yes: zero,
        no: zero,
        abstain: zero,
        quorum: zero,
      };
    }
  } catch (e) {
    // Sometimes loading DAO proposals called in the moment when proposal was **just** created
    // Thus, calling `getProposalVotes` for such a proposal reverts with error
    // This helps to prevent such case, while event listeners still should get proper data
    logError('Error while retrieving Azorius proposal votes', e);
    const zero = BigNumber.from(0);
    return {
      yes: zero,
      no: zero,
      abstain: zero,
      quorum: zero,
    };
  }
};

const getProposalVotes = (
  erc20VotedEvents: ERC20VotedEvent[] | undefined,
  erc721VotedEvents: ERC721VotedEvent[] | undefined,
  proposalId: BigNumber,
): (ProposalVote | ERC721ProposalVote)[] => {
  if (erc20VotedEvents !== undefined && erc721VotedEvents !== undefined) {
    logError("two voting contracts? we don't support that.");
    return [];
  }

  if (erc20VotedEvents !== undefined) {
    const erc20ProposalVoteEvents = erc20VotedEvents.filter(voteEvent =>
      proposalId.eq(voteEvent.args.proposalId),
    );

    return erc20ProposalVoteEvents.map(({ args: { voter, voteType, ...rest } }) => ({
      ...rest,
      voter,
      choice: VOTE_CHOICES[voteType],
    }));
  } else if (erc721VotedEvents !== undefined) {
    const erc721ProposalVoteEvents = erc721VotedEvents.filter(voteEvent =>
      proposalId.eq(voteEvent.args.proposalId),
    );

    return erc721ProposalVoteEvents.map(({ args: { voter, voteType, tokenIds, ...rest } }) => ({
      ...rest,
      voter,
      choice: VOTE_CHOICES[voteType],
      weight: BigNumber.from(1),
      tokenIds: tokenIds.map(id => id.toString()),
    }));
  }

  return [];
};

export const mapProposalCreatedEventToProposal = async (
  erc20StrategyContract: LinearERC20Voting | undefined,
  erc721StrategyContract: LinearERC721Voting | undefined,
  strategyType: VotingStrategyType,
  proposalId: BigNumber,
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
    noVotes: BigNumber.from(0),
    yesVotes: BigNumber.from(0),
    abstainVotes: BigNumber.from(0),
  };

  if (erc20StrategyContract !== undefined) {
    proposalVotes = await erc20StrategyContract.getProposalVotes(proposalId);
  } else if (erc721StrategyContract !== undefined) {
    proposalVotes = await erc721StrategyContract.getProposalVotes(proposalId);
  }

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
    const executedEvent = (await executedEvents)?.find(event =>
      BigNumber.from(event.args[0]).eq(proposalId),
    );
    transactionHash = executedEvent?.transactionHash;
  }

  const proposal: AzoriusProposal = {
    eventType: ActivityEventType.Governance,
    eventDate: new Date(block.timestamp * 1000),
    proposalId: proposalId.toString(),
    targets,
    proposer,
    startBlock: BigNumber.from(proposalVotes.startBlock),
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
  multiSigTransaction:
    | SafeMultisigTransactionWithTransfersResponse
    | SafeMultisigTransactionResponse,
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
