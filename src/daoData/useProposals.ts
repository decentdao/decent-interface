import { useState, useEffect, useCallback } from "react";
import { GovernorModule } from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber } from "ethers";

type ProposalDataWithoutVotes = {
  number: number;
  id: BigNumber;
  idSubstring: string | undefined;
  startBlock: BigNumber;
  endBlock: BigNumber;
  startTime: Date | undefined;
  endTime: Date | undefined;
  startTimeString: string | undefined;
  endTimeString: string | undefined;
  proposer: string;
  description: string;
  state: number | undefined;
  stateString: string | undefined;
  forVotesPercent: number | undefined;
  againstVotesPercent: number | undefined;
  abstainVotesPercent: number | undefined;
};

export interface ProposalData extends ProposalDataWithoutVotes {
  userVote: number | undefined,
  userVoteString: "For" | "Against" | "Abstain" | undefined;
}

type UserVote = {
  proposalId: BigNumber;
  vote: number | undefined;
};

const useProposals = (governorModule: GovernorModule | undefined) => {
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [proposalsWithoutVotes, setProposalsWithoutVotes] = useState<ProposalDataWithoutVotes[]>([]);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const { provider, account } = useWeb3();

  const getVoteString = (voteNumber: number) => {
    if (voteNumber === 0) {
      return "Against";
    } else if (voteNumber === 1) {
      return "For";
    } else if (voteNumber === 2) {
      return "Abstain";
    } else {
      return undefined;
    }
  };

  const getStateString = (state: number | undefined) => {
    if (state === 1) {
      return "Open";
    } else {
      return "Closed";
    }
  };

  const getTimestampString = (time: Date | undefined) => {
    if (time === undefined) return;

    return (
      time.toLocaleDateString("en-US", { month: "short" }) +
      " " +
      time.toLocaleDateString("en-US", { day: "numeric" }) +
      ", " +
      time.toLocaleDateString("en-US", { year: "numeric" })
    );
  };

  const getBlockTimestamp = useCallback(
    (blockNumber: number) => {
      if (!provider) return;

      return provider.getBlockNumber().then((currentBlockNumber) => {
        if (blockNumber <= currentBlockNumber) {
          // Requested block is in the past
          return provider.getBlock(blockNumber).then((block) => {
            return new Date(block.timestamp * 1000);
          });
        } else {
          // Requested block is in the future, need to estimate future block timestamp
          return Promise.all([
            provider.getBlock(currentBlockNumber),
            provider.getBlock(currentBlockNumber - 1000),
          ]).then(([currentBlock, oldBlock]) => {
            const averageBlockSeconds =
              (currentBlock.timestamp - oldBlock.timestamp) / 1000;
            const futureBlockTimestamp =
              currentBlock.timestamp +
              (blockNumber - currentBlockNumber) * averageBlockSeconds;
            return new Date(futureBlockTimestamp * 1000);
          });
        }
      });
    },
    [provider]
  );

  // Get the vote counts for a given proposal
  const getProposalVotes = useCallback(
    (governorModule: GovernorModule, proposalId: BigNumber) => {
      return governorModule.proposalVotes(proposalId);
    },
    []
  );

  // Get the state of a given proposal
  const getProposalState = useCallback(
    (governorModule: GovernorModule, proposalId: BigNumber) => {
      return governorModule.state(proposalId);
    },
    []
  );

  // Get proposal data that isn't included in the proposal created event
  const getProposalData = useCallback(
    (governorModule: GovernorModule, proposal: ProposalDataWithoutVotes) => {
      return Promise.all([
        getProposalVotes(governorModule, proposal.id),
        getProposalState(governorModule, proposal.id),
        getBlockTimestamp(proposal.startBlock.toNumber()),
        getBlockTimestamp(proposal.endBlock.toNumber()),
        proposal,
      ]).then(([votes, state, startTime, endTime, proposal]) => {
        const totalVotes = votes.forVotes
          .add(votes.againstVotes)
          .add(votes.abstainVotes);
        if (totalVotes.gt(0)) {
          proposal.forVotesPercent =
            votes.forVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
          proposal.againstVotesPercent =
            votes.againstVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
          proposal.abstainVotesPercent =
            votes.abstainVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
        } else {
          proposal.forVotesPercent = 0;
          proposal.againstVotesPercent = 0;
          proposal.abstainVotesPercent = 0;
        }

        proposal.idSubstring = `${proposal.id
          .toString()
          .substring(0, 4)}...${proposal.id.toString().slice(-4)}`;
        proposal.state = state;
        proposal.startTime = startTime;
        proposal.endTime = endTime;
        proposal.startTimeString = getTimestampString(startTime);
        proposal.endTimeString = getTimestampString(endTime);
        proposal.stateString = getStateString(proposal.state);

        return proposal;
      });
    },
    [getBlockTimestamp, getProposalState, getProposalVotes]
  );

  // Get all of the current users votes
  useEffect(() => {
    if (governorModule === undefined || account === undefined) {
      return;
    }

    const filter = governorModule.filters.VoteCast(account);

    governorModule
      .queryFilter(filter)
      .then((voteCastEvents) => {
        setUserVotes(
          voteCastEvents.map((voteCastEvent) => {
            const userVote: UserVote = {
              proposalId: voteCastEvent.args.proposalId,
              vote: voteCastEvent.args.support,
            };
            return userVote;
          })
        );
      })
      .catch(console.error);
  }, [governorModule, account]);

  // Combine proposalsWithoutVotes and userVotes into proposals
  useEffect(() => {
    const newProposals: ProposalData[] = proposalsWithoutVotes.map((proposal) => {
      const userProposalVote = userVotes.find(userVote => userVote.proposalId.eq(proposal.id));

      const newProposal: ProposalData = {
        number: proposal.number,
        id: proposal.id,
        idSubstring: proposal.idSubstring,
        startBlock: proposal.startBlock,
        endBlock: proposal.endBlock,
        startTime: proposal.startTime,
        endTime: proposal.endTime,
        startTimeString: proposal.startTimeString,
        endTimeString: proposal.endTimeString,
        proposer: proposal.proposer,
        description: proposal.description,
        state: proposal.state,
        stateString: proposal.stateString,
        forVotesPercent: proposal.forVotesPercent,
        againstVotesPercent: proposal.againstVotesPercent,
        abstainVotesPercent: proposal.abstainVotesPercent,
        userVote: userProposalVote ? userProposalVote.vote : undefined,
        userVoteString: userProposalVote && userProposalVote.vote ? getVoteString(userProposalVote.vote) : undefined,
      };
      
      return newProposal;
    });

    setProposals(newProposals);
  }, [proposalsWithoutVotes, userVotes]);

  // Get initial proposal events
  useEffect(() => {
    if (governorModule === undefined) {
      return;
    }

    const filter = governorModule.filters.ProposalCreated();

    // Get an array of all the ProposalCreated events
    governorModule
      .queryFilter(filter)
      .then((proposalEvents) => {
        const newProposals = proposalEvents.map((proposalEvent, index) => {
          const newProposal: ProposalDataWithoutVotes = {
            number: index,
            id: proposalEvent.args.proposalId,
            idSubstring: undefined,
            startBlock: proposalEvent.args.startBlock,
            endBlock: proposalEvent.args.endBlock,
            startTime: undefined,
            endTime: undefined,
            startTimeString: undefined,
            endTimeString: undefined,
            proposer: proposalEvent.args.proposer,
            description: proposalEvent.args.description,
            state: undefined,
            stateString: undefined,
            forVotesPercent: undefined,
            againstVotesPercent: undefined,
            abstainVotesPercent: undefined,
          };

          return newProposal;
        });

        return newProposals;
      })
      .then((newProposals) => {
        return Promise.all(
          newProposals.map((newProposal) =>
            getProposalData(governorModule, newProposal)
          )
        );
      })
      .then((newProposals) => {
        setProposalsWithoutVotes(newProposals);
      })
      .catch(console.error);
  }, [
    getProposalData,
    getBlockTimestamp,
    getProposalVotes,
    getProposalState,
    governorModule,
  ]);

  // Setup proposal events listener
  useEffect(() => {
    if (governorModule === undefined) {
      return;
    }

    const filter = governorModule.filters.ProposalCreated();

    const listenerCallback = (
      proposalId: BigNumber,
      proposer: string,
      targets: string[],
      values: BigNumber[],
      signatures: string[],
      calldatas: string[],
      startBlock: BigNumber,
      endBlock: BigNumber,
      description: string,
      _: any
    ) => {
      const newProposal: ProposalDataWithoutVotes = {
        number: proposals.length,
        id: proposalId,
        idSubstring: undefined,
        startBlock: startBlock,
        endBlock: endBlock,
        startTime: undefined,
        endTime: undefined,
        startTimeString: undefined,
        endTimeString: undefined,
        proposer: proposer,
        description: description,
        state: undefined,
        stateString: undefined,
        forVotesPercent: undefined,
        againstVotesPercent: undefined,
        abstainVotesPercent: undefined,
      };

      getProposalData(governorModule, newProposal)
        .then((newProposal) => setProposalsWithoutVotes([...proposals, newProposal]))
        .catch(console.error);
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [
    getProposalData,
    governorModule,
    proposals,
    getProposalVotes,
    getProposalState,
  ]);

  // Setup user vote events listener
  useEffect(() => {
    if (governorModule === undefined) {
      return;
    }

    const filter = governorModule.filters.VoteCast(account);

    const listenerCallback = (
      voter: string,
      proposalId: BigNumber,
      support: number,
      weight: BigNumber,
      reason: string,
      _: any,
    ) => {
      const newUserVote: UserVote = {
        proposalId: proposalId,
        vote: support,
      }

      setUserVotes([...userVotes, newUserVote]);
    }

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [account, governorModule, userVotes]);

  return proposals;
};

export default useProposals;
