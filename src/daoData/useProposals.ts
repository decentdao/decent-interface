import { useState, useEffect, useCallback } from "react";
import { GovernorModule, GovernorModule__factory } from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber } from "ethers";

export type ProposalData = {
  number: number;
  id: BigNumber;
  startBlock: BigNumber;
  endBlock: BigNumber;
  forVotes: BigNumber | undefined;
  againstVotes: BigNumber | undefined;
  abstainVotes: BigNumber | undefined;
};

const useProposals = (moduleAddresses: string[] | undefined) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const { signerOrProvider } = useWeb3();

  const getProposalVotes = useCallback(
    (proposalId: BigNumber) => {
      if (governorModule === undefined) return;

      return governorModule.proposalVotes(proposalId);
    },
    [governorModule]
  );

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

    governorModule
      .queryFilter(filter)
      .then((proposalEvents) => {
        const newProposals = 
          proposalEvents.map((proposalEvent, index) => {
            const newProposal: ProposalData = {
              number: index,
              id: proposalEvent.args.proposalId,
              startBlock: proposalEvent.args.startBlock,
              endBlock: proposalEvent.args.endBlock,
              forVotes: undefined,
              againstVotes: undefined,
              abstainVotes: undefined,
            };
            
            return newProposal;
          });

          Promise.all(newProposals.map((proposal) => (getProposalVotes(proposal.id)))).then((votes) => {
            votes.forEach((vote, index) => {
              if(vote === undefined) return;
              newProposals[index].forVotes = vote.forVotes;
              newProposals[index].againstVotes = vote.againstVotes;
              newProposals[index].abstainVotes = vote.abstainVotes;
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
      _: any
    ) => {
      const newProposal: ProposalData = {
        number: proposals.length,
        id: proposalId,
        startBlock: startBlock,
        endBlock: endBlock,
        forVotes: undefined,
        againstVotes: undefined,
        abstainVotes: undefined,
      };

      getProposalVotes(newProposal.id)
        ?.then((proposalVotes) => {
          newProposal.forVotes = proposalVotes[1];
          newProposal.againstVotes = proposalVotes[0];
          newProposal.abstainVotes = proposalVotes[2];

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
