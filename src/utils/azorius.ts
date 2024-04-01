import {
  Azorius,
  LinearERC20Voting,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
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
  strategyContract: LinearERC20Voting | LinearERC721Voting,
  strategyType: VotingStrategyType,
  proposalId: BigNumber,
) => {
  let quorum;

  if (strategyType === VotingStrategyType.LINEAR_ERC20) {
    try {
      quorum = await (strategyContract as LinearERC20Voting).quorumVotes(proposalId);
    } catch (e) {
      // For who knows reason - strategy.quorumVotes might give you an error
      // Seems like occuring when token deployment haven't worked properly
      logError('Error while getting strategy quorum', e);
      quorum = BigNumber.from(0);
    }
  } else if (strategyType === VotingStrategyType.LINEAR_ERC721) {
    quorum = await (strategyContract as LinearERC721Voting).quorumThreshold();
  } else {
    quorum = BigNumber.from(0);
  }

  return quorum;
};

export const getProposalVotesSummary = async (
  strategy: LinearERC20Voting | LinearERC721Voting,
  strategyType: VotingStrategyType,
  proposalId: BigNumber,
): Promise<ProposalVotesSummary> => {
  try {
    const { yesVotes, noVotes, abstainVotes } = await strategy.getProposalVotes(proposalId);

    return {
      yes: yesVotes,
      no: noVotes,
      abstain: abstainVotes,
      quorum: await getQuorum(strategy, strategyType, proposalId),
    };
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

export const getProposalVotes = async (
  strategyContract: LinearERC20Voting | LinearERC721Voting,
  proposalId: BigNumber,
): Promise<ProposalVote[] | ERC721ProposalVote[]> => {
  const voteEventFilter = strategyContract.filters.Voted();
  const votes = await strategyContract.queryFilter(voteEventFilter);
  const proposalVotesEvent = votes.filter(voteEvent => proposalId.eq(voteEvent.args.proposalId));

  return proposalVotesEvent.map(({ args: { voter, voteType, ...rest } }) => {
    return {
      ...rest,
      voter,
      choice: VOTE_CHOICES[voteType],
    };
  });
};

export const mapProposalCreatedEventToProposal = async (
  strategyContract: LinearERC20Voting | LinearERC721Voting,
  strategyType: VotingStrategyType,
  proposalId: BigNumber,
  proposer: string,
  azoriusContract: Azorius,
  provider: Providers,
  data?: ProposalData,
) => {
  const { endBlock, startBlock, abstainVotes, yesVotes, noVotes } =
    await strategyContract.getProposalVotes(proposalId);
  const quorum = await getQuorum(strategyContract, strategyType, proposalId);

  const deadlineSeconds = await getTimeStamp(endBlock, provider);
  const state = await getAzoriusProposalState(azoriusContract, proposalId);
  const votes = await getProposalVotes(strategyContract, proposalId);
  const block = await provider.getBlock(startBlock);
  const votesSummary = {
    yes: yesVotes,
    no: noVotes,
    abstain: abstainVotes,
    quorum,
  };

  const targets = data ? data.decodedTransactions.map(tx => tx.target) : [];

  let transactionHash: string | undefined;
  if (state === FractalProposalState.EXECUTED) {
    const proposalExecutedFilter = azoriusContract.filters.ProposalExecuted();
    const proposalExecutedEvents = await azoriusContract.queryFilter(proposalExecutedFilter);
    const executedEvent = proposalExecutedEvents.find(event =>
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
    startBlock: BigNumber.from(startBlock),
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
