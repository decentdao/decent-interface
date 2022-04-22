import { useState, useEffect, useCallback } from "react";
import { GovernorModule, GovernorModule__factory } from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber } from "ethers";

export type ProposalData = {
  number: number;
  id: BigNumber;
  startBlock: BigNumber;
  endBlock: BigNumber;
  startTime: Date | undefined;
  endTime: Date | undefined;
  proposer: string;
  description: string;
  state: number | undefined;
  forVotesPercent: number | undefined;
  againstVotesPercent: number | undefined;
  abstainVotesPercent: number | undefined;
};

const useProposals = (moduleAddresses: string[] | undefined) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const { provider, signerOrProvider } = useWeb3();

  const getBlockTimestamp = useCallback((blockNumber: number) => {
    if (!provider) return;
    return provider.getBlock(blockNumber)
    .then((block) => {
        console.log(block);
        return new Date(block.timestamp * 1000);
    });

  }, [provider]);

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

  // Set the Governor module contract
  useEffect(() => {
    if (
      moduleAddresses === undefined ||
      moduleAddresses[1] === undefined ||
      signerOrProvider === undefined
    ) {
      setGovernorModule(undefined);
      return;
    }

    setGovernorModule(
      GovernorModule__factory.connect(moduleAddresses[1], signerOrProvider)
    );
  }, [moduleAddresses, signerOrProvider]);

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
            startBlock: proposalEvent.args.startBlock,
            endBlock: proposalEvent.args.endBlock,
            startTime: undefined,
            endTime: undefined,
            proposer: proposalEvent.args.proposer,
            description: proposalEvent.args.description,
            state: undefined,
            forVotesPercent: undefined,
            againstVotesPercent: undefined,
            abstainVotesPercent: undefined,
          };

          return newProposal;
        });
        return Promise.all([
          Promise.all(
            newProposals.map((proposal) =>
              getProposalVotes(governorModule, proposal.id)
            )
          ),
          Promise.all(
            newProposals.map((proposal) =>
              getProposalState(governorModule, proposal.id)
            )
          ),
          Promise.all(
            newProposals.map((proposal) => 
              getBlockTimestamp(proposal.startBlock.toNumber()))
          ),
          Promise.all(
            newProposals.map((proposal) => 
              getBlockTimestamp(proposal.endBlock.toNumber()))
          ),
          newProposals,
        ]);
      })
      .then(([votes, states, startTimes, endTimes, newProposals]) => {
        newProposals.forEach((proposal, index) => {
          const vote = votes[index];
          const state = states[index];
          const startTime = startTimes[index];
          const endTime = endTimes[index];

          const totalVotes = vote.forVotes
            .add(vote.againstVotes)
            .add(vote.abstainVotes);
          if (totalVotes.gt(0)) {
            newProposals[index].forVotesPercent =
              vote.forVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
            newProposals[index].againstVotesPercent =
              vote.againstVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
            newProposals[index].abstainVotesPercent =
              vote.abstainVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
          } else {
            newProposals[index].forVotesPercent = 0;
            newProposals[index].againstVotesPercent = 0;
            newProposals[index].abstainVotesPercent = 0;
          }

          newProposals[index].state = state;
          newProposals[index].startTime = startTime;
          newProposals[index].endTime = endTime;          
        });

        setProposals(newProposals);
      })
      .catch(console.error);
  }, [getBlockTimestamp, getProposalVotes, getProposalState, governorModule]);

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
        startBlock: startBlock,
        endBlock: endBlock,
        startTime: undefined,
        endTime: undefined,
        proposer: proposer,
        description: description,
        state: undefined,
        forVotesPercent: undefined,
        againstVotesPercent: undefined,
        abstainVotesPercent: undefined,
      };

      getProposalVotes(governorModule, newProposal.id)
        ?.then((vote) => {
          const totalVotes = vote.forVotes
            .add(vote.againstVotes)
            .add(vote.abstainVotes);
          if (totalVotes.gt(0)) {
            newProposal.forVotesPercent =
              vote.forVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
            newProposal.againstVotesPercent =
              vote.againstVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
            newProposal.abstainVotesPercent =
              vote.abstainVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
          } else {
            newProposal.forVotesPercent = 0;
            newProposal.againstVotesPercent = 0;
            newProposal.abstainVotesPercent = 0;
          }

          getProposalState(governorModule, newProposal.id)?.then((state) => {
            newProposal.state = state;
            setProposals([...proposals, newProposal]);
          });
        })
        .catch(console.error);
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule, proposals, getProposalVotes, getProposalState]);

  return proposals;
};

export default useProposals;
