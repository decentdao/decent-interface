import { useState, useEffect } from 'react';
import { ExtendedSnapshotProposal } from '../../../../types';

export default function useTotalVotes({ proposal }: { proposal?: ExtendedSnapshotProposal }) {
  const [totalVotesCasted, setTotalVotesCasted] = useState(0);

  useEffect(() => {
    if (proposal) {
      let newTotalVotesCasted = 0;
      proposal.votes.forEach(vote => (newTotalVotesCasted += vote.votingWeight));
      setTotalVotesCasted(newTotalVotesCasted);
    }
  }, [proposal, totalVotesCasted]);

  return { totalVotesCasted };
}
