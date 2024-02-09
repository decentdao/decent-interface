import { useState, useEffect } from 'react';
import useSnapshotProposal from '../../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { FractalProposal } from '../../../../types';

export default function useSnapshotUserVotingWeight({
  proposal,
}: {
  proposal: FractalProposal | null | undefined;
}) {
  const [votingWeight, setVotingWeight] = useState(0);
  const { loadVotingWeight } = useSnapshotProposal(proposal);

  useEffect(() => {
    async function getVotingWeight() {
      const votingWeightData = await loadVotingWeight();
      setVotingWeight(votingWeightData.votingWeight);
    }
    getVotingWeight();
  }, [loadVotingWeight]);

  return { votingWeight };
}
