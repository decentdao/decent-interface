import { useState, useEffect } from "react";
import { GovernorModule } from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber, providers } from "ethers";

type ProposalDataWithoutUserData = {
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
  targets: string[];
  signatures: string[];
  calldatas: string[];
  description: string;
  state: number | undefined;
  stateString: string | undefined;
  forVotesPercent: number | undefined;
  againstVotesPercent: number | undefined;
  abstainVotesPercent: number | undefined;
  eta: number | undefined;
};
export interface ProposalData extends ProposalDataWithoutUserData {
  userVote: number | undefined;
  userVoteString: "For" | "Against" | "Abstain" | undefined;
  userVotePower: BigNumber | undefined;
}

type UserVote = {
  proposalId: BigNumber;
  vote: number | undefined;
};

type UserVotePower = {
  proposalId: BigNumber;
  votePower: BigNumber | undefined;
};

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
  if (state === 0) {
    return "Pending";
  } else if (state === 1) {
    return "Active";
  } else if (state === 2) {
    return "Canceled";
  } else if (state === 3) {
    return "Defeated";
  } else if (state === 4) {
    return "Succeeded";
  } else if (state === 5) {
    return "Queued";
  } else if (state === 6) {
    return "Expired";
  } else if (state === 7) {
    return "Executed";
  }
};

const getTimestampString = (time: Date | undefined) => {
  if (time === undefined) return "...";

  return (
    time.toLocaleDateString("en-US", { month: "short" }) +
    " " +
    time.toLocaleDateString("en-US", { day: "numeric" }) +
    ", " +
    time.toLocaleDateString("en-US", { year: "numeric" })
  );
};

const getBlockTimestamp = (
  provider: providers.BaseProvider | undefined,
  blockNumber: number
) => {
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
};

const getUserVotePower = (
  governorModule: GovernorModule,
  account: string,
  proposalStartBlockNumber: number,
  currentBlockNumber: number | undefined
) => {
  if (
    currentBlockNumber === undefined ||
    proposalStartBlockNumber >= currentBlockNumber
  ) {
    return undefined;
  }

  return governorModule.getVotes(account, proposalStartBlockNumber);
};

// Get proposal data that isn't included in the proposal created event
const getProposalData = (
  provider: providers.BaseProvider | undefined,
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
  ]).then(([votes, state, startTime, endTime, eta, proposal]) => {
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
    proposal.eta = eta.toNumber();

    return proposal;
  });
};

const useUserVotes = (governorModule: GovernorModule | undefined) => {
  const { account } = useWeb3();
  const [userVotes, setUserVotes] = useState<UserVote[]>();

  // Get all of the current users votes
  useEffect(() => {
    if (governorModule === undefined || account === undefined) {
      setUserVotes(undefined);
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

  // Setup user vote events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setUserVotes(undefined);
      return;
    }

    const filter = governorModule.filters.VoteCast(account);

    const listenerCallback = (
      voter: string,
      proposalId: BigNumber,
      support: number,
      weight: BigNumber,
      reason: string,
      _: any
    ) => {
      const newUserVote: UserVote = {
        proposalId: proposalId,
        vote: support,
      };

      setUserVotes((existingUserVotes) => {
        if (existingUserVotes === undefined) {
          return undefined;
        }

        return [...existingUserVotes, newUserVote];
      });
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [account, governorModule]);

  return userVotes;
};

const useUserVotePowers = (
  proposalsWithoutUserData: ProposalDataWithoutUserData[] | undefined,
  governorModule: GovernorModule | undefined,
  currentBlockNumber: number | undefined
) => {
  const { account } = useWeb3();
  const [userVotePowers, setUserVotePowers] = useState<UserVotePower[]>();

  // Get user vote power
  useEffect(() => {
    if (
      governorModule === undefined ||
      account === undefined ||
      currentBlockNumber === undefined ||
      proposalsWithoutUserData === undefined
    ) {
      setUserVotePowers(undefined);
      return;
    }

    Promise.all(
      proposalsWithoutUserData.map((proposalWithoutUserData) => {
        return getUserVotePower(
          governorModule,
          account,
          proposalWithoutUserData.startBlock.toNumber(),
          currentBlockNumber
        );
      })
    ).then((newUserVotePowerValues) => {
      setUserVotePowers(
        proposalsWithoutUserData.map((proposal, index) => {
          const newUserVotePower: UserVotePower = {
            proposalId: proposal.id,
            votePower: newUserVotePowerValues[index],
          };

          return newUserVotePower;
        })
      );
    });
  }, [governorModule, account, currentBlockNumber, proposalsWithoutUserData]);

  return userVotePowers;
};

const useProposalsWithoutUserData = (
  governorModule: GovernorModule | undefined
) => {
  const { account, provider } = useWeb3();
  const [proposalsWithoutUserData, setProposalsWithoutUserData] =
    useState<ProposalDataWithoutUserData[]>();

  // Get initial proposal events
  useEffect(() => {
    if (governorModule === undefined || account === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalCreated();

    // Get an array of all the ProposalCreated events
    governorModule
      .queryFilter(filter)
      .then((proposalEvents) => {
        const newProposals = proposalEvents.map((proposalEvent, index) => {
          const newProposal: ProposalDataWithoutUserData = {
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
            targets: proposalEvent.args.targets,
            signatures: proposalEvent.args.signatures,
            calldatas: proposalEvent.args.calldatas,
            description: proposalEvent.args.description,
            state: undefined,
            stateString: undefined,
            forVotesPercent: undefined,
            againstVotesPercent: undefined,
            abstainVotesPercent: undefined,
            eta: undefined,
          };
          return newProposal;
        });

        return newProposals;
      })
      .then((newProposals) => {
        return Promise.all(
          newProposals.map((newProposal) =>
            getProposalData(provider, governorModule, newProposal)
          )
        );
      })
      .then((newProposals) => {
        setProposalsWithoutUserData(newProposals);
      })
      .catch(console.error);
  }, [account, governorModule, provider]);

  // Setup proposal created events listener
  useEffect(() => {
    if (governorModule === undefined || account === undefined) {
      setProposalsWithoutUserData(undefined);
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
      const newProposal: ProposalDataWithoutUserData = {
        number: -1,
        id: proposalId,
        idSubstring: undefined,
        startBlock: startBlock,
        endBlock: endBlock,
        startTime: undefined,
        endTime: undefined,
        startTimeString: undefined,
        endTimeString: undefined,
        proposer: proposer,
        targets: targets,
        signatures: signatures,
        calldatas: calldatas,
        description: description,
        state: undefined,
        stateString: undefined,
        forVotesPercent: undefined,
        againstVotesPercent: undefined,
        abstainVotesPercent: undefined,
        eta: undefined,
      };

      getProposalData(provider, governorModule, newProposal)
        .then((newProposal) => {
          setProposalsWithoutUserData((existingProposalsWithoutUserData) => {
            if (existingProposalsWithoutUserData === undefined) {
              return undefined;
            }

            newProposal.number = existingProposalsWithoutUserData.length;
            return [...existingProposalsWithoutUserData, newProposal];
          });
        })
        .catch(console.error);
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [account, governorModule, provider]);

  return proposalsWithoutUserData;
};

const useProposals = (
  governorModule: GovernorModule | undefined,
  currentBlockNumber: number | undefined
) => {
  const userVotes = useUserVotes(governorModule);
  const proposalsWithoutUserData = useProposalsWithoutUserData(governorModule);
  const userVotePowers = useUserVotePowers(
    proposalsWithoutUserData,
    governorModule,
    currentBlockNumber
  );
  const [proposals, setProposals] = useState<ProposalData[]>();

  // Combine proposalsWithoutUserData and user data into proposals
  useEffect(() => {
    if (proposalsWithoutUserData === undefined || userVotes === undefined || userVotePowers === undefined) {
      setProposals(undefined);
      return;
    }

    const newProposals: ProposalData[] = proposalsWithoutUserData.map(
      (proposal) => {
        const userProposalVote = userVotes.find((userVote) =>
          userVote.proposalId.eq(proposal.id)
        );

        const userProposalVotePower = userVotePowers.find((userVotePower) => 
          userVotePower.proposalId.eq(proposal.id)
        );

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
          targets: proposal.targets,
          signatures: proposal.signatures,
          calldatas: proposal.calldatas,
          description: proposal.description,
          state: proposal.state,
          stateString: proposal.stateString,
          forVotesPercent: proposal.forVotesPercent,
          againstVotesPercent: proposal.againstVotesPercent,
          abstainVotesPercent: proposal.abstainVotesPercent,
          eta: proposal.eta,
          userVotePower: userProposalVotePower ? userProposalVotePower.votePower : undefined,
          userVote: userProposalVote ? userProposalVote.vote : undefined,
          userVoteString:
            userProposalVote && userProposalVote.vote
              ? getVoteString(userProposalVote.vote)
              : undefined,
        };

        return newProposal;
      }
    );

    setProposals(newProposals);
  }, [proposalsWithoutUserData, userVotes, userVotePowers]);

  // Setup proposal queued events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposals(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalQueued();

    const listenerCallback = (proposalId: BigNumber, _: any) => {
      setProposals((existingProposals) => {
        if (existingProposals === undefined) {
          return undefined;
        }

        const updatedProposalIndex = existingProposals.findIndex((proposal) =>
          proposalId.eq(proposal.id)
        );
        const newProposals = [...existingProposals];
        newProposals[updatedProposalIndex].state = 5;
        newProposals[updatedProposalIndex].stateString = getStateString(5);
        return newProposals;
      });
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule]);

  return proposals;
};

export default useProposals;
