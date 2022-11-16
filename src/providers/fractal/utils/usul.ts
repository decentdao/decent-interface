import { BigNumber, Signer } from 'ethers';
import { OZLinearVoting__factory, Usul } from '../../../assets/typechain-types/usul';
import { Providers } from '../../../contexts/web3Data/types';
import { decodeTransactionHashes } from '../../../utils/crypto';
import {
  Proposal,
  ProposalIsPassedError,
  ProposalState,
  ProposalVotesSummary,
  strategyProposalStates,
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
    console.error('Error while getting strategy quorum', quorum);
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
  const state = await getProposalState(usulContract, proposalNumber, signerOrProvider);
  const votes = await getProposalVotesSummary(usulContract, proposalNumber, signerOrProvider);

  // @todo: Retrieve proposal hashes for future decoding
  const MOCK_TX_HASHES = ['0x', '0x', '0x'];
  const proposal: Proposal = {
    proposalNumber,
    proposer,
    startBlock,
    deadline: deadline.toNumber(),
    state,
    govTokenAddress: await strategyContract.governanceToken(),
    votes,
    txHashes: MOCK_TX_HASHES,
    decodedTransactions: decodeTransactionHashes(MOCK_TX_HASHES),
  };

  return proposal;
};
