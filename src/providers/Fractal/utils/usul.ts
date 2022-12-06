import { OZLinearVoting__factory, FractalUsul } from '@fractal-framework/fractal-contracts';
import { BigNumber, Signer } from 'ethers';
import { logError } from '../../../helpers/errorLogging';
import { Providers } from '../../Web3Data/types';
import {
  Proposal,
  ProposalIsPassedError,
  ProposalMetaData,
  ProposalState,
  ProposalVotesSummary,
  strategyProposalStates,
} from '../types/usul';

export const getProposalState = async (
  usulContract: FractalUsul,
  proposalId: BigNumber,
  signerOrProvider: Signer | Providers
): Promise<ProposalState> => {
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
        return ProposalState.Pending;
      } catch (e: any) {
        if (e.message.match(ProposalIsPassedError.MAJORITY_YES_VOTES_NOT_REACHED)) {
          return ProposalState.Rejected;
        } else if (e.message.match(ProposalIsPassedError.QUORUM_NOT_REACHED)) {
          return ProposalState.Failed;
        } else if (e.message.match(ProposalIsPassedError.PROPOSAL_STILL_ACTIVE)) {
          return ProposalState.Active;
        }
        return ProposalState.Failed;
      }
    }
    return ProposalState.Active;
  }
  return strategyProposalStates[state];
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
  const state = await getProposalState(usulContract, proposalNumber, signerOrProvider);
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

  const proposal: Proposal = {
    proposalNumber,
    proposer,
    startBlock,
    deadline: deadline.toNumber(),
    state,
    govTokenAddress: await strategyContract.governanceToken(),
    votes,
    txHashes,
    metaData,
  };

  return proposal;
};
