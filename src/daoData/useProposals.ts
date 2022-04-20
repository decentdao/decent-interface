import { useState, useEffect } from "react";
import { useDAOData } from "./index";
import {
  DAO,
  AccessControl,
  GovernorModule,
  GovernorModule__factory,
} from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber } from "ethers";

export type ProposalData = {
  number: number;
  id: BigNumber;
  yesVotes: BigNumber;
  noVotes: BigNumber;
  abstainVotes: BigNumber;
};

const useProposals = (moduleAddresses: string[] | undefined) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const { signerOrProvider } = useWeb3();

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
        setProposals(
          proposalEvents.map((proposalEvent, index) => {
            const newProposal: ProposalData = {
              number: index,
              id: proposalEvent.args.proposalId,
              yesVotes: BigNumber.from("0"),
              noVotes: BigNumber.from("0"),
              abstainVotes: BigNumber.from("0"),
            };

            return newProposal;
          })
        );
      })
      .catch(console.error);
  }, [governorModule]);

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
        yesVotes: BigNumber.from("0"),
        noVotes: BigNumber.from("0"),
        abstainVotes: BigNumber.from("0")
      }

      setProposals([...proposals, newProposal]);
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule, proposals]);

  return proposals;
};

export default useProposals;
