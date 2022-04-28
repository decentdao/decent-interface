import { useState, useEffect, useCallback } from "react";
import { GovernorModule, GovernorModule__factory, TimelockUpgradeable } from "../typechain-types";
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
  targets: string[];
  signatures: string[];
  calldatas: string[];
  description: string;
  state: number | undefined;
  stateString: string | undefined;
  forVotesPercent: number | undefined;
  againstVotesPercent: number | undefined;
  abstainVotesPercent: number | undefined;
};

const useProposals = (
  governorModuleContract: GovernorModule | undefined,
  timelockModuleContract: TimelockUpgradeable | undefined,
) => {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const { provider } = useWeb3();


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
    if (governorModuleContract === undefined) {
      return;
    }

    const filter = governorModuleContract.filters.ProposalCreated();

    // Get an array of all the ProposalCreated events
    governorModuleContract
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
            targets: proposalEvent.args.targets,
            signatures: proposalEvent.args.signatures,
            calldatas: proposalEvent.args.calldatas,
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
            getProposalData(governorModuleContract, newProposal)
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
    governorModuleContract,
  ]);

  // Setup proposal events listener
  useEffect(() => {
    if (governorModuleContract === undefined) {
      return;
    }

    const filter = governorModuleContract.filters.ProposalCreated();

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
        targets: targets,
        signatures: signatures,
        calldatas: calldatas,
        description: description,
        state: undefined,
        stateString: undefined,
        forVotesPercent: undefined,
        againstVotesPercent: undefined,
        abstainVotesPercent: undefined,
      };

      getProposalData(governorModuleContract, newProposal)
        .then((newProposal) => setProposals([...proposals, newProposal]))
        .catch(console.error);
    };

    governorModuleContract.on(filter, listenerCallback);

    return () => {
      governorModuleContract.off(filter, listenerCallback);
    };
  }, [
    getProposalData,
    governorModuleContract,
    proposals,
    getProposalVotes,
    getProposalState,
  ]);

  return proposals;
};

export default useProposals;
