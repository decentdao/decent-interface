import { providers, BigNumber } from 'ethers';
import { GovernorModule } from '../../../assets/typechain-types/module-governor';
import { ProposalDataWithoutUserData } from '../types/proposal';

export const getVoteString = (voteNumber: number) => {
  if (voteNumber === 0) {
    return 'Against';
  } else if (voteNumber === 1) {
    return 'For';
  } else if (voteNumber === 2) {
    return 'Abstain';
  } else {
    return undefined;
  }
};

export const getTimestampString = (time: Date | undefined) => {
  if (time === undefined) return '...';

  return (
    time.toLocaleDateString('en-US', { month: 'short' }) +
    ' ' +
    time.toLocaleDateString('en-US', { day: 'numeric' }) +
    ', ' +
    time.toLocaleDateString('en-US', { year: 'numeric' })
  );
};

export const getBlockTimestamp = (provider: providers.BaseProvider | null, blockNumber: number) => {
  if (!provider) return;

  return provider.getBlockNumber().then(currentBlockNumber => {
    if (blockNumber <= currentBlockNumber) {
      // Requested block is in the past
      return provider.getBlock(blockNumber).then(block => {
        return new Date(block.timestamp * 1000);
      });
    } else {
      // Requested block is in the future, need to estimate future block timestamp
      return Promise.all([
        provider.getBlock(currentBlockNumber),
        provider.getBlock(currentBlockNumber - 1000),
      ]).then(([currentBlock, oldBlock]) => {
        const averageBlockSeconds = (currentBlock.timestamp - oldBlock.timestamp) / 1000;
        const futureBlockTimestamp =
          currentBlock.timestamp + (blockNumber - currentBlockNumber) * averageBlockSeconds;
        return new Date(futureBlockTimestamp * 1000);
      });
    }
  });
};

export const getUserVotePower = (
  governorModule: GovernorModule,
  account: string,
  proposalStartBlockNumber: number,
  currentBlockNumber: number
) => {
  if (proposalStartBlockNumber >= currentBlockNumber) {
    return undefined;
  }

  return governorModule.getVotes(account, proposalStartBlockNumber);
};

export const getVotePercentages = (
  againstVotesCount: BigNumber | undefined,
  forVotesCount: BigNumber | undefined,
  abstainVotesCount: BigNumber | undefined
) => {
  if (againstVotesCount === undefined) againstVotesCount = BigNumber.from('0');
  if (forVotesCount === undefined) forVotesCount = BigNumber.from('0');
  if (abstainVotesCount === undefined) abstainVotesCount = BigNumber.from('0');

  const totalVotes = againstVotesCount.add(forVotesCount).add(abstainVotesCount);

  if (totalVotes.eq(0)) {
    return {
      againstVotesPercent: 0,
      forVotesPercent: 0,
      abstainVotesPercent: 0,
    };
  }
  return {
    againstVotesPercent: againstVotesCount.mul(1000000).div(totalVotes).toNumber() / 10000,
    forVotesPercent: forVotesCount.mul(1000000).div(totalVotes).toNumber() / 10000,
    abstainVotesPercent: abstainVotesCount.mul(1000000).div(totalVotes).toNumber() / 10000,
  };
};

// Get proposal data that isn't included in the proposal created event
export const getProposalData = (
  provider: providers.BaseProvider | null,
  governorModule: GovernorModule,
  proposal: ProposalDataWithoutUserData
) => {
  return Promise.all([
    governorModule.proposalVotes(proposal.id),
    governorModule.state(proposal.id),
    getBlockTimestamp(provider, proposal.startBlock.toNumber()),
    getBlockTimestamp(provider, proposal.endBlock.toNumber()),
    governorModule.proposalEta(proposal.id),
    proposal,
  ]).then(([votes, state, startTime, endTime, eta, proposalData]) => {
    const votePercentages = getVotePercentages(
      votes.againstVotes,
      votes.forVotes,
      votes.abstainVotes
    );

    proposalData.againstVotesPercent = votePercentages.againstVotesPercent;
    proposalData.forVotesPercent = votePercentages.forVotesPercent;
    proposalData.abstainVotesPercent = votePercentages.abstainVotesPercent;

    proposalData.idSubstring = `${proposalData.id.toString().substring(0, 4)}...${proposalData.id
      .toString()
      .slice(-4)}`;
    proposalData.state = state;
    proposalData.startTime = startTime;
    proposalData.endTime = endTime;
    proposalData.startTimeString = getTimestampString(startTime);
    proposalData.endTimeString = getTimestampString(endTime);
    proposalData.eta = eta.toNumber();
    proposalData.forVotesCount = votes.forVotes;
    proposalData.againstVotesCount = votes.againstVotes;
    proposalData.abstainVotesCount = votes.abstainVotes;

    return proposalData;
  });
};
