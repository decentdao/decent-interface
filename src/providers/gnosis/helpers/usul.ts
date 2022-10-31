import { BigNumber, Signer } from 'ethers';
import { OZLinearVoting__factory, Usul } from '../../../assets/typechain-types/usul';
import { Providers } from '../../../contexts/web3Data/types';
import {
  Proposal,
  ProposalState,
  ProposalVotesSummary,
  strategyProposalStates,
  ProposalIsPassedError,
} from '../types/usul';

export const getProposalState = async (
  usulContract: Usul,
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
        return 'statePending' as ProposalState;
      } catch (e: any) {
        if (e.message.match(ProposalIsPassedError.MAJORITY_YES_NOT_REACHED)) {
          return 'stateFailed' as ProposalState;
        } else if (e.message.match(ProposalIsPassedError.QUORUM_NOT_REACHED)) {
          return 'stateFailed' as ProposalState;
        } else if (e.message.match(ProposalIsPassedError.PROPOSAL_STILL_ACTIVE)) {
          return 'stateActive' as ProposalState;
        }
        return 'stateFailed' as ProposalState;
      }
    }
    return 'stateActive' as ProposalState;
  }
  return strategyProposalStates[state];
};

export const getProposalVotesSummary = async (
  usulContract: Usul,
  proposalNumber: BigNumber,
  signerOrProvider: Signer | Providers
): Promise<ProposalVotesSummary> => {
  const { strategy: strategyAddress } = await usulContract.proposals(proposalNumber);
  const strategy = await OZLinearVoting__factory.connect(strategyAddress, signerOrProvider);
  const { yesVotes, noVotes, abstainVotes } = await strategy.proposals(proposalNumber);
  return {
    yes: yesVotes,
    no: noVotes,
    abstain: abstainVotes,
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
  const { deadline } = await strategyContract.proposals(proposalNumber);
  const state = await getProposalState(usulContract, proposalNumber, signerOrProvider);
  const votes = await getProposalVotesSummary(usulContract, proposalNumber, signerOrProvider);
  const proposal: Proposal = {
    proposalNumber,
    proposer,
    deadline: deadline.toNumber(),
    state,
    govTokenAddress: await strategyContract.governanceToken(),
    votes,
  };

  return proposal;
};
