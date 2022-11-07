import { useCallback, useEffect, useState } from 'react';
import { TypedListener } from '../../../assets/typechain-types/usul/common';
import { ProposalCreatedEvent } from '../../../assets/typechain-types/usul/contracts/Usul';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { Proposal } from '../types/usul';
import { mapProposalCreatedEventToProposal } from '../utils/usul';
import useUsul from './useUsul';

export default function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>();

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const { usulContract } = useUsul();

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

  return {
    proposals,
  };
}
