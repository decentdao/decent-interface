import { useState, useEffect } from 'react';
import { GovernorModule } from '../../../assets/typechain-types/module-governor';
import { ProposalData } from '../types';
import { getVoteString } from '../utils';
import { useUserVotes } from './useUserVotes';
import { useUserVotePowers } from './useUserVotePowers';
import { useProposalsWithoutUserData } from './useProposalsWithoutUserData';

const useProposals = (governorModule: GovernorModule | undefined) => {
  const userVotes = useUserVotes(governorModule);
  const proposalsWithoutUserData = useProposalsWithoutUserData(governorModule);
  const userVotePowers = useUserVotePowers(proposalsWithoutUserData, governorModule);
  const [proposals, setProposals] = useState<ProposalData[]>();

  // Combine proposalsWithoutUserData and user data into proposals
  useEffect(() => {
    if (proposalsWithoutUserData === undefined || userVotes === undefined) {
      setProposals(undefined);
      return;
    }

    const newProposals: ProposalData[] = proposalsWithoutUserData.map(proposal => {
      const userProposalVote = userVotes.find(userVote => userVote.proposalId.eq(proposal.id));

      const userProposalVotePower = userVotePowers?.find(userVotePower =>
        userVotePower.proposalId.eq(proposal.id)
      );

      const newProposal: ProposalData = {
        ...proposal,
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
