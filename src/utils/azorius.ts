import { Azorius, LinearERC20Voting } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { strategyFractalProposalStates } from '../constants/strategy';

import { logError } from '../helpers/errorLogging';
import {
  FractalProposalState,
  ProposalVotesSummary,
  ProposalVote,
  VOTE_CHOICES,
  ContractConnection,
  ProposalMetaData,
  AzoriusProposal,
  ActivityEventType,
  Parameter,
  SafeMultisigTransactionResponse,
  DataDecoded,
  FractalModuleData,
  FractalModuleType,
  DecodedTransaction,
} from '../types';
import { Providers } from '../types/network';
import { getTimeStamp } from './contract';

export const getAzoriusProposalState = async (
  azoriusContract: Azorius,
  proposalId: BigNumber
): Promise<FractalProposalState> => {
  const state = await azoriusContract.proposalState(proposalId);
  return strategyFractalProposalStates[state];
};

export const getProposalVotesSummary = async (
  strategy: LinearERC20Voting,
  proposalId: BigNumber
): Promise<ProposalVotesSummary> => {
  const { yesVotes, noVotes, abstainVotes } = await strategy.getProposalVotes(proposalId);

  let quorum;

  try {
    quorum = await strategy.quorumVotes(proposalId);
  } catch (e) {
    // For who knows reason - strategy.quorumVotes might give you an error
    // Seems like occuring when token deployment haven't worked properly
    logError('Error while getting strategy quorum');
    quorum = BigNumber.from(0);
  }

  return {
    yes: yesVotes,
    no: noVotes,
    abstain: abstainVotes,
    quorum,
  };
};

export const getProposalVotes = async (
  strategyContract: LinearERC20Voting,
  proposalId: BigNumber
): Promise<ProposalVote[]> => {
  const voteEventFilter = strategyContract.filters.Voted();
  const votes = await strategyContract.queryFilter(voteEventFilter);
  const proposalVotesEvent = votes.filter(voteEvent => proposalId.eq(voteEvent.args.proposalId));

  return proposalVotesEvent.map(({ args }) => ({
    voter: args.voter,
    choice: VOTE_CHOICES[args.voteType],
    weight: args.weight,
  }));
};

export const mapProposalCreatedEventToProposal = async (
  strategyContract: LinearERC20Voting,
  proposalId: BigNumber,
  proposer: string,
  azoriusContract: ContractConnection<Azorius>,
  provider: Providers,
  chainId: number,
  metaData?: ProposalMetaData
) => {
  const { endBlock, startBlock, abstainVotes, yesVotes, noVotes } =
    await strategyContract.getProposalVotes(proposalId);
  let quorum;

  try {
    quorum = await strategyContract.quorumVotes(proposalId);
  } catch (e) {
    // For who knows reason - strategy.quorumVotes might give you an error
    // Seems like occuring when token deployment haven't worked properly
    logError('Error while getting strategy quorum');
    quorum = BigNumber.from(0);
  }
  const deadlineSeconds = await getTimeStamp(endBlock, provider);
  const state = await getAzoriusProposalState(azoriusContract.asSigner, proposalId);
  const votes = await getProposalVotes(strategyContract, proposalId);
  const block = await provider.getBlock(startBlock);
  const votesSummary = {
    yes: yesVotes,
    no: noVotes,
    abstain: abstainVotes,
    quorum,
  };

  const targets = metaData ? metaData.decodedTransactions.map(tx => tx.target) : [];

  let transactionHash: string | undefined;
  if (state === FractalProposalState.EXECUTED) {
    const proposalExecutedFilter = azoriusContract.asSigner.filters.ProposalExecuted();
    const proposalExecutedEvents = await azoriusContract.asSigner.queryFilter(
      proposalExecutedFilter
    );
    const executedEvent = proposalExecutedEvents.find(event =>
      BigNumber.from(event.args[0]).eq(proposalId)
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
    govTokenAddress: await strategyContract.governanceToken(),
    votes,
    votesSummary,
    metaData,
  };

  return proposal;
};

export const parseMultiSendTransactions = (
  eventTransactionMap: Map<number, any>,
  parameters?: Parameter[]
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
  isMultiSigTransaction: boolean
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
