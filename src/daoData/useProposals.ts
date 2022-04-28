import { useState, useEffect, useCallback } from "react";
import { GovernorModule } from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber } from "ethers";

export type ProposalData = {
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

const useProposals = (governorModule: GovernorModule | undefined) => {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const { provider } = useWeb3();

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

  const getProposalData = useCallback(
    (governorModule: GovernorModule, proposal: ProposalData) => {
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
          const newProposal: ProposalData = {
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
        setProposals(newProposals);
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
      const newProposal: ProposalData = {
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
        .then((newProposal) => setProposals([...proposals, newProposal]))
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

  return proposals;
};

export default useProposals;
