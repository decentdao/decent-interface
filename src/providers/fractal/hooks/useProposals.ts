import { useCallback, useEffect, useMemo, useState } from 'react';
import { TypedListener } from '../../../assets/typechain-types/usul/common';
import { ProposalCreatedEvent } from '../../../assets/typechain-types/usul/contracts/Usul';
import { useWeb3Provider } from '../../../providers/web3Data/hooks/useWeb3Provider';
import { SortBy } from '../../../types';
import { Proposal, ProposalState } from '../types/usul';
import { mapProposalCreatedEventToProposal } from '../utils/usul';
import useUsul from './useUsul';

export default function useProposals({
  sortBy,
  filters,
}: {
  sortBy?: SortBy;
  filters?: ProposalState[];
}) {
  const { usulContract } = useUsul();
  const [proposals, setProposals] = useState<Proposal[]>();

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (strategyAddress, proposalNumber, proposer) => {
      if (!usulContract || !signerOrProvider) {
        return;
      }
      const proposal = await mapProposalCreatedEventToProposal(
        strategyAddress,
        proposalNumber,
        proposer,
        usulContract,
        signerOrProvider
      );

      setProposals(prevState => {
        if (prevState) {
          return [...prevState, proposal];
        }
        return [proposal];
      });
    },
    [usulContract, signerOrProvider]
  );

  const getProposalsTotal = (state: ProposalState) => {
    if (proposals) {
      return proposals.filter(proposal => proposal.state === state).length;
    }
  };

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }

    const filter = usulContract.filters.ProposalCreated();

    usulContract.on(filter, proposalCreatedListener);

    return () => {
      usulContract.off(filter, proposalCreatedListener);
    };
  }, [usulContract, signerOrProvider, proposalCreatedListener]);

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }

    const loadProposals = async () => {
      const proposalCreatedFilter = usulContract.filters.ProposalCreated();
      const proposalCreatedEvents = await usulContract.queryFilter(proposalCreatedFilter);
      const mappedProposals = await Promise.all(
        proposalCreatedEvents.map(({ args }) => {
          return mapProposalCreatedEventToProposal(
            args[0],
            args[1],
            args[2],
            usulContract,
            signerOrProvider
          );
        })
      );
      setProposals(mappedProposals);
    };

    loadProposals();
  }, [usulContract, signerOrProvider]);

  const sortedAndFilteredProposals = useMemo(() => {
    if (proposals && (sortBy || filters)) {
      let sorted = proposals; // They returned in oldest sorting from contract by default
      if (sortBy === SortBy.Newest) {
        sorted = [...proposals].reverse(); // .reverse mutates original array - we have to create new one
      }

      let filtered = sorted;
      if (filters) {
        filtered = filtered.filter(proposal => filters.includes(proposal.state));
      }

      return filtered;
    }

    return proposals;
  }, [sortBy, filters, proposals]);

  return {
    proposals: sortedAndFilteredProposals,
    getProposalsTotal,
  };
}
