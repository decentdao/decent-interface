import { useState, useEffect, useCallback } from "react";
import { GovernorModule, GovernorModule__factory } from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber } from "ethers";

export type ProposalData = {
  number: number;
  id: BigNumber;
  startBlock: BigNumber;
  endBlock: BigNumber;
  proposer: string;
  description: string;
  forVotesPercent: number | undefined;
  againstVotesPercent: number | undefined;
  abstainVotesPercent: number | undefined;
};

const useProposals = (moduleAddresses: string[] | undefined) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const { signerOrProvider } = useWeb3();

  // Get the vote counts for a given proposal
  const getProposalVotes = useCallback(
    (proposalId: BigNumber) => {
      if (governorModule === undefined) return;

      return governorModule.proposalVotes(proposalId);
    },
    [governorModule]
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
            proposer: proposalEvent.args.proposer,
            description: proposalEvent.args.description,
            forVotesPercent: undefined,
            againstVotesPercent: undefined,
            abstainVotesPercent: undefined,
          };

          return newProposal;
        });

        // Get the vote counts for each proposal and add them to the newProposals object
        Promise.all(
          newProposals.map((proposal) => getProposalVotes(proposal.id))
        ).then((votes) => {
          votes.forEach((vote, index) => {
            if (vote === undefined) return;
            const totalVotes = vote.forVotes
              .add(vote.againstVotes)
              .add(vote.abstainVotes);
            if (totalVotes.gt(0)) {
              newProposals[index].forVotesPercent =
                vote.forVotes.mul(1000000).div(totalVotes).toNumber() / 10000;
              newProposals[index].againstVotesPercent =
                vote.againstVotes.mul(1000000).div(totalVotes).toNumber() /
                10000;
              newProposals[index].abstainVotesPercent =
                vote.abstainVotes.mul(1000000).div(totalVotes).toNumber() /
                10000;
            } else {
              newProposals[index].forVotesPercent = 0;
              newProposals[index].againstVotesPercent = 0;
              newProposals[index].abstainVotesPercent = 0;
            }
          });

          setProposals(newProposals);
        });
      })
      .catch(console.error);
  }, [getProposalVotes, governorModule]);

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
        proposer: proposer,
        description: description,
        forVotesPercent: undefined,
        againstVotesPercent: undefined,
        abstainVotesPercent: undefined,
      };

      getProposalVotes(newProposal.id)
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

          setProposals([...proposals, newProposal]);
        })
        .catch(console.error);
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule, proposals, getProposalVotes]);

  return proposals;
};

export default useProposals;
