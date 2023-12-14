import { useState, useEffect } from 'react';
import useSnapshotProposal from '../../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { ExtendedSnapshotProposal } from '../../../../types';

export default function useTotalVotes({ proposal }: { proposal?: ExtendedSnapshotProposal }) {
  const [totalVotesCasted, setTotalVotesCasted] = useState(0);
  const { getVoteWeight } = useSnapshotProposal(proposal);

  useEffect(() => {
    if (proposal) {
      let newTotalVotesCasted = 0;
      proposal.votes.forEach(vote => (newTotalVotesCasted += getVoteWeight(vote)));
      setTotalVotesCasted(newTotalVotesCasted);
    }
  }, [proposal, totalVotesCasted, getVoteWeight]);

  return { totalVotesCasted };
}
