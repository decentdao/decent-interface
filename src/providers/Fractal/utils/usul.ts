import {
  FractalUsul,
  OZLinearVoting__factory,
  OZLinearVoting,
} from '@fractal-framework/fractal-contracts';
import {
  SafeMultisigTransactionWithTransfersResponse,
  SafeMultisigTransactionResponse,
  TransferWithTokenInfoResponse,
} from '@gnosis.pm/safe-service-client';
import { BigNumber, constants, Signer } from 'ethers';
import { logError } from '../../../helpers/errorLogging';
import { GnosisTransferType } from '../../../types';
import { Providers } from '../../Web3Data/types';
import { strategyTxProposalStates } from '../governance/constants';
import {
  ProposalIsPassedError,
  ProposalMetaData,
  ProposalVote,
  ProposalVotesSummary,
  TxProposalState,
  UsulProposal,
  VOTE_CHOICES,
} from './../governance/types';

export const getTxProposalState = async (
  usulContract: FractalUsul,
  proposalId: BigNumber,
  signerOrProvider: Signer | Providers
): Promise<TxProposalState> => {
  const state = await usulContract.state(proposalId);
  if (state === 0) {
    // Usul says proposal is active, but we need to get more info in this case
    const { strategy: strategyAddress } = await usulContract.proposals(proposalId);
    const strategy = OZLinearVoting__factory.connect(strategyAddress, signerOrProvider);
    const { deadline } = await strategy.proposals(proposalId);
    if (Number(deadline.toString()) * 1000 < new Date().getTime()) {
      // Deadline has passed: we have to determine if proposal is passed or failed
      // Dirty hack: isPassed will fail if the proposal is not passed
      try {
        // This function never returns false, it either returns true or throws an error
        await strategy.isPassed(proposalId);
        return TxProposalState.Pending;
      } catch (e: any) {
        if (e.message.match(ProposalIsPassedError.MAJORITY_YES_VOTES_NOT_REACHED)) {
          return TxProposalState.Rejected;
        } else if (e.message.match(ProposalIsPassedError.QUORUM_NOT_REACHED)) {
          return TxProposalState.Failed;
        } else if (e.message.match(ProposalIsPassedError.PROPOSAL_STILL_ACTIVE)) {
          return TxProposalState.Active;
        }
        return TxProposalState.Failed;
      }
    }
    return TxProposalState.Active;
  }
  return strategyTxProposalStates[state];
};

export const getProposalVotesSummary = async (
  usulContract: FractalUsul,
  proposalNumber: BigNumber,
  signerOrProvider: Signer | Providers
): Promise<ProposalVotesSummary> => {
  const { strategy: strategyAddress } = await usulContract.proposals(proposalNumber);
  const strategy = OZLinearVoting__factory.connect(strategyAddress, signerOrProvider);
  const { yesVotes, noVotes, abstainVotes, startBlock } = await strategy.proposals(proposalNumber);

  let quorum;

  try {
    quorum = await strategy.quorum(startBlock);
  } catch (e) {
    // For who knows reason - strategy.quorum might give you an error
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
  strategyContract: OZLinearVoting,
  proposalNumber: BigNumber
): Promise<ProposalVote[]> => {
  const voteEventFilter = strategyContract.filters.Voted();
  const votes = await strategyContract.queryFilter(voteEventFilter);
  const proposalVotesEvent = votes.filter(voteEvent =>
    voteEvent.args.proposalId.eq(proposalNumber)
  );

  return proposalVotesEvent.map(({ args }) => ({
    voter: args.voter,
    choice: VOTE_CHOICES[args.support],
    weight: args.weight,
  }));
};

export const mapProposalCreatedEventToProposal = async (
  strategyAddress: string,
  proposalNumber: BigNumber,
  proposer: string,
  usulContract: FractalUsul,
  signerOrProvider: Signer | Providers,
  metaData?: ProposalMetaData
) => {
  const strategyContract = OZLinearVoting__factory.connect(strategyAddress, signerOrProvider);
  const { deadline, startBlock } = await strategyContract.proposals(proposalNumber);
  const state = await getTxProposalState(usulContract, proposalNumber, signerOrProvider);
  const votesSummary = await getProposalVotesSummary(
    usulContract,
    proposalNumber,
    signerOrProvider
  );
  const votes = await getProposalVotes(strategyContract, proposalNumber);

  const txHashes = [];
  let i = 0;
  let finished = false;
  while (!finished) {
    try {
      // Usul nor strategy contract is not returning whole array -
      // this is the only way to get those hashes
      const txHash = await usulContract.getTxHash(proposalNumber, i);
      txHashes.push(txHash);
      i++;
    } catch (e) {
      // Means there's no hashes anymore
      finished = true;
    }
  }

  const proposal: UsulProposal = {
    proposalNumber: proposalNumber.toString(),
    proposer,
    startBlock,
    deadline: deadline.toNumber(),
    state,
    govTokenAddress: await strategyContract.governanceToken(),
    votes,
    votesSummary,
    txHashes,
    metaData,
  };

  return proposal;
};

export const eventTransactionMapping = (
  multiSigTransaction:
    | SafeMultisigTransactionWithTransfersResponse
    | SafeMultisigTransactionResponse,
  isMultiSigTransaction: boolean
) => {
  const eventTransactionMap = new Map<number, any>();
  const parseTransactions = (parameters: any[]) => {
    if (!parameters || !parameters.length) {
      return;
    }
    parameters.forEach((param: any) => {
      const dataDecoded = param.dataDecoded || param.valueDecoded;

      if (param.to) {
        eventTransactionMap.set(eventTransactionMap.size, {
          ...param,
        });
      }
      return parseTransactions(dataDecoded);
    });
  };

  const dataDecoded = multiSigTransaction.dataDecoded as any;
  if (dataDecoded && isMultiSigTransaction) {
    parseTransactions(dataDecoded.parameters);
  }
  return eventTransactionMap;
};

export const totalsReducer = (prev: Map<any, any>, cur: TransferWithTokenInfoResponse) => {
  if (cur.type === GnosisTransferType.ETHER && cur.value) {
    if (prev.has(constants.AddressZero)) {
      const prevValue = prev.get(constants.AddressZero);
      prev.set(constants.AddressZero, {
        bn: prevValue.bn.add(BigNumber.from(cur.value)),
        symbol: 'ETHER',
        decimals: 18,
      });
    }
    prev.set(constants.AddressZero, {
      bn: BigNumber.from(cur.value),
      symbol: 'ETHER',
      decimals: 18,
    });
  }
  if (cur.type === GnosisTransferType.ERC721 && cur.tokenInfo && cur.tokenId) {
    prev.set(`${cur.tokenAddress}:${cur.tokenId}`, {
      bn: BigNumber.from(1),
      symbol: cur.tokenInfo.symbol,
      decimals: 0,
    });
  }
  if (cur.type === GnosisTransferType.ERC20 && cur.value && cur.tokenInfo) {
    if (prev.has(cur.tokenInfo.address)) {
      const prevValue = prev.get(cur.tokenInfo.address);
      prev.set(cur.tokenInfo.address, {
        ...prevValue,
        bn: prevValue.bn.add(BigNumber.from(cur.value)),
      });
    } else {
      prev.set(cur.tokenAddress, {
        bn: BigNumber.from(cur.value),
        symbol: cur.tokenInfo.symbol,
        decimals: cur.tokenInfo.decimals,
      });
    }
  }

  return prev;
};
