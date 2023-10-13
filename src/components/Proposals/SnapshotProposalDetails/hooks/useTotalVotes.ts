import { useState, useEffect } from 'react';
import { ExtendedSnapshotProposal } from '../../../../types';

export default function useTotalVotes({ proposal }: { proposal?: ExtendedSnapshotProposal }) {
  const [totalVotesCasted, setTotalVotesCasted] = useState(0);

  useEffect(() => {
    if (proposal) {
      let newTotalVotesCasted = 0;
      if (proposal.votesBreakdown) {
        Object.keys(proposal.votesBreakdown).forEach(voteChoice => {
          const voteChoiceBreakdown = proposal.votesBreakdown[voteChoice];
          newTotalVotesCasted += voteChoiceBreakdown.total;
        });

        if (newTotalVotesCasted !== totalVotesCasted) {
          setTotalVotesCasted(newTotalVotesCasted);
        }
      }
    }
  }, [proposal, totalVotesCasted]);

  return { totalVotesCasted };
}
