import { BigNumber, Signer } from 'ethers';
import { OZLinearVoting__factory, Usul } from '../../../assets/typechain-types/usul';
import { logError } from '../../../helpers/errorLogging';
import { decodeTransactionHashes } from '../../../utils/crypto';
import { Providers } from '../../Web3Data/types';
import { strategyTxProposalStates } from '../governance/constants';
import {
  ProposalIsPassedError,
  ProposalVotesSummary,
  TxProposalState,
  UsulProposal,
} from './../governance/types';

export const getTxProposalState = async (
  usulContract: Usul,
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
  usulContract: Usul,
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

export const mapProposalCreatedEventToProposal = async (
  strategyAddress: string,
  proposalNumber: BigNumber,
  proposer: string,
  usulContract: Usul,
  signerOrProvider: Signer | Providers
) => {
  const strategyContract = OZLinearVoting__factory.connect(strategyAddress, signerOrProvider);
  const { deadline, startBlock } = await strategyContract.proposals(proposalNumber);
  const state = await getTxProposalState(usulContract, proposalNumber, signerOrProvider);
  const votes = await getProposalVotesSummary(usulContract, proposalNumber, signerOrProvider);

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
    txHashes,
    decodedTransactions: decodeTransactionHashes(txHashes),
  };

  return proposal;
};
