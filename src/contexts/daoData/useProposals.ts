import { useState, useEffect } from 'react';
import { GovernorModule } from '../../assets/typechain-types/module-governor';
import { BigNumber, providers } from 'ethers';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';

// @todo this will need to be fixed so that eslint doesn't have to be ignored for this file
// current there are unused variables that because of typing can not be removed without a little thought
/* eslint-disable @typescript-eslint/no-unused-vars */

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

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
  state: ProposalState | undefined;
  forVotesCount: BigNumber | undefined;
  againstVotesCount: BigNumber | undefined;
  abstainVotesCount: BigNumber | undefined;
  forVotesPercent: number | undefined;
  againstVotesPercent: number | undefined;
  abstainVotesPercent: number | undefined;
  eta: number | undefined;
};
export interface ProposalData extends ProposalDataWithoutUserData {
  userVote: number | undefined;
  userVoteString: 'For' | 'Against' | 'Abstain' | undefined;
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
    return 'Against';
  } else if (voteNumber === 1) {
    return 'For';
  } else if (voteNumber === 2) {
    return 'Abstain';
  } else {
    return undefined;
  }
};

const getTimestampString = (time: Date | undefined) => {
  if (time === undefined) return '...';

  return (
    time.toLocaleDateString('en-US', { month: 'short' }) +
    ' ' +
    time.toLocaleDateString('en-US', { day: 'numeric' }) +
    ', ' +
    time.toLocaleDateString('en-US', { year: 'numeric' })
  );
};

const getBlockTimestamp = (provider: providers.BaseProvider | null, blockNumber: number) => {
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

const getUserVotePower = (
  governorModule: GovernorModule,
  account: string,
  proposalStartBlockNumber: number,
  currentBlockNumber: number | undefined
) => {
  if (currentBlockNumber === undefined || proposalStartBlockNumber >= currentBlockNumber) {
    return undefined;
  }

  return governorModule.getVotes(account, proposalStartBlockNumber);
};

const getVotePercentages = (
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
const getProposalData = (
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

const useUserVotes = (governorModule: GovernorModule | undefined) => {
  const {
    state: { account },
  } = useWeb3Provider();
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
      .then(voteCastEvents => {
        setUserVotes(
          voteCastEvents.map(voteCastEvent => {
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

      setUserVotes(existingUserVotes => {
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
  const {
    state: { account },
  } = useWeb3Provider();
  const [userVotePowers, setUserVotePowers] = useState<UserVotePower[]>();

  // Get user vote power
  useEffect(() => {
    if (
      governorModule === undefined ||
      !account ||
      currentBlockNumber === undefined ||
      proposalsWithoutUserData === undefined
    ) {
      setUserVotePowers(undefined);
      return;
    }

    Promise.all(
      proposalsWithoutUserData.map(proposalWithoutUserData => {
        return getUserVotePower(
          governorModule,
          account,
          proposalWithoutUserData.startBlock.toNumber(),
          currentBlockNumber
        );
      })
    )
      .then(newUserVotePowerValues => {
        setUserVotePowers(
          proposalsWithoutUserData.map((proposal, index) => {
            const newUserVotePower: UserVotePower = {
              proposalId: proposal.id,
              votePower: newUserVotePowerValues[index],
            };

            return newUserVotePower;
          })
        );
      })
      .catch(console.error);
  }, [governorModule, account, currentBlockNumber, proposalsWithoutUserData]);

  return userVotePowers;
};

const useProposalsWithoutUserData = (
  currentBlockNumber: number | undefined,
  governorModule: GovernorModule | undefined
) => {
  const {
    state: { provider },
  } = useWeb3Provider();
  const [proposalsWithoutUserData, setProposalsWithoutUserData] =
    useState<ProposalDataWithoutUserData[]>();

  // Get initial proposal events
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalCreated();

    // Get an array of all the ProposalCreated events
    governorModule
      .queryFilter(filter)
      .then(proposalEvents => {
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
            forVotesCount: undefined,
            againstVotesCount: undefined,
            abstainVotesCount: undefined,
            forVotesPercent: undefined,
            againstVotesPercent: undefined,
            abstainVotesPercent: undefined,
            eta: undefined,
          };
          return newProposal;
        });

        return newProposals;
      })
      .then(newProposals => {
        return Promise.all(
          newProposals.map(newProposal => getProposalData(provider, governorModule, newProposal))
        );
      })
      .then(newProposals => {
        setProposalsWithoutUserData(newProposals);
      })
      .catch(console.error);
  }, [governorModule, provider]);

  // Setup proposal created events listener
  useEffect(() => {
    if (governorModule === undefined) {
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
        forVotesCount: undefined,
        againstVotesCount: undefined,
        abstainVotesCount: undefined,
        forVotesPercent: undefined,
        againstVotesPercent: undefined,
        abstainVotesPercent: undefined,
        eta: undefined,
      };

      getProposalData(provider, governorModule, newProposal)
        .then(proposalData => {
          setProposalsWithoutUserData(existingProposalsWithoutUserData => {
            if (existingProposalsWithoutUserData === undefined) {
              return undefined;
            }

            proposalData.number = existingProposalsWithoutUserData.length;
            return [...existingProposalsWithoutUserData, proposalData];
          });
        })
        .catch(console.error);
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule, provider]);

  // Setup proposal queued events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalQueued();

    const listenerCallback = (proposalId: BigNumber, _: any) => {
      governorModule
        .proposalEta(proposalId)
        .then(proposalEta => {
          setProposalsWithoutUserData(existingProposals => {
            if (existingProposals === undefined) {
              return undefined;
            }

            const updatedProposalIndex = existingProposals.findIndex(proposal =>
              proposalId.eq(proposal.id)
            );
            const newProposals = [...existingProposals];
            newProposals[updatedProposalIndex].state = ProposalState.Queued;
            newProposals[updatedProposalIndex].eta = proposalEta.toNumber();
            return newProposals;
          });
        })
        .catch(console.error);
    };
    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule]);

  // Setup proposal executed events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalExecuted();

    const listenerCallback = (proposalId: BigNumber, _: any) => {
      setProposalsWithoutUserData(existingProposals => {
        if (existingProposals === undefined) {
          return undefined;
        }

        const updatedProposalIndex = existingProposals.findIndex(proposal =>
          proposalId.eq(proposal.id)
        );
        const newProposals = [...existingProposals];
        newProposals[updatedProposalIndex].state = ProposalState.Executed;
        return newProposals;
      });
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule]);

  // Setup vote cast events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.VoteCast();

    const listenerCallback = (
      voter: string,
      proposalId: BigNumber,
      support: number,
      weight: BigNumber,
      _: any
    ) => {
      setProposalsWithoutUserData(existingProposals => {
        if (existingProposals === undefined) {
          return undefined;
        }

        const updatedProposalIndex = existingProposals.findIndex(proposal =>
          proposalId.eq(proposal.id)
        );

        const newProposals = [...existingProposals];
        const newProposal = newProposals[updatedProposalIndex];

        if (support === 0) {
          if (newProposal.againstVotesCount === undefined) {
            newProposal.againstVotesCount = weight;
          } else {
            newProposal.againstVotesCount = newProposal.againstVotesCount.add(weight);
          }
        } else if (support === 1) {
          if (newProposal.forVotesCount === undefined) {
            newProposal.forVotesCount = weight;
          } else {
            newProposal.forVotesCount = newProposal.forVotesCount.add(weight);
          }
        } else {
          if (newProposal.abstainVotesCount === undefined) {
            newProposal.abstainVotesCount = weight;
          } else {
            newProposal.abstainVotesCount = newProposal.abstainVotesCount.add(weight);
          }
        }

        const votePercentages = getVotePercentages(
          newProposal.againstVotesCount,
          newProposal.forVotesCount,
          newProposal.abstainVotesCount
        );

        newProposal.againstVotesPercent = votePercentages.againstVotesPercent;
        newProposal.forVotesPercent = votePercentages.forVotesPercent;
        newProposal.abstainVotesPercent = votePercentages.abstainVotesPercent;

        newProposals[updatedProposalIndex] = newProposal;

        return newProposals;
      });
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule]);

  // Check for pending proposals that have become active
  // Check for Active proposals that have become defeated/Succeeded
  useEffect(() => {
    if (currentBlockNumber === undefined) {
      return;
    }

    setProposalsWithoutUserData(existingProposals => {
      if (existingProposals === undefined) return undefined;

      return existingProposals.map(existingProposal => {
        const newProposal = existingProposal;
        if (
          newProposal.state === ProposalState.Pending &&
          newProposal.startBlock.toNumber() <= currentBlockNumber
        ) {
          newProposal.state = ProposalState.Active;
        } else if (
          newProposal.state === ProposalState.Active &&
          currentBlockNumber > newProposal.endBlock.toNumber()
        ) {
          if (newProposal.forVotesCount!.lte(newProposal.againstVotesCount!)) {
            newProposal.state = ProposalState.Defeated;
          }
          if (newProposal.forVotesCount!.gt(newProposal.againstVotesCount!)) {
            newProposal.state = ProposalState.Succeeded;
          }
        }

        return newProposal;
      });
    });
  }, [currentBlockNumber]);

  return proposalsWithoutUserData;
};

const useProposals = (
  governorModule: GovernorModule | undefined,
  currentBlockNumber: number | undefined
) => {
  const userVotes = useUserVotes(governorModule);
  const proposalsWithoutUserData = useProposalsWithoutUserData(currentBlockNumber, governorModule);
  const userVotePowers = useUserVotePowers(
    proposalsWithoutUserData,
    governorModule,
    currentBlockNumber
  );
  const [proposals, setProposals] = useState<ProposalData[]>();

  // Combine proposalsWithoutUserData and user data into proposals
  useEffect(() => {
    if (
      proposalsWithoutUserData === undefined ||
      userVotes === undefined ||
      userVotePowers === undefined
    ) {
      setProposals(undefined);
      return;
    }

    const newProposals: ProposalData[] = proposalsWithoutUserData.map(proposal => {
      const userProposalVote = userVotes.find(userVote => userVote.proposalId.eq(proposal.id));

      const userProposalVotePower = userVotePowers.find(userVotePower =>
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
        forVotesCount: proposal.forVotesCount,
        againstVotesCount: proposal.againstVotesCount,
        abstainVotesCount: proposal.abstainVotesCount,
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
    });

    setProposals(newProposals);
  }, [proposalsWithoutUserData, userVotes, userVotePowers]);

  return proposals;
};

export default useProposals;
