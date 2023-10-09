import { gql } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalProposal, SnapshotProposal } from '../../../../types';
import client from './';

export default function useSnapshotProposal(proposal: FractalProposal | null | undefined) {
  const {
    node: { daoSnapshotURL },
    readOnly: {
      user: { address },
    },
  } = useFractal();

  const snapshotProposal = proposal as SnapshotProposal;
  const isSnapshotProposal = useMemo(
    () => !!snapshotProposal?.snapshotProposalId,
    [snapshotProposal]
  );
  const loadProposal = useCallback(async () => {}, []);

  const loadVotingWeight = useCallback(async () => {
    if (snapshotProposal?.snapshotProposalId) {
      const queryResult = await client
        .query({
          query: gql`
      query UserVotingWeight {
          vp(
              voter: "${address}"
              space: "${daoSnapshotURL}"
              proposal: "${snapshotProposal.snapshotProposalId}"
          ) {
              vp
              vp_by_strategy
              vp_state
          }
      }`,
        })
        .then(({ data: { vp } }) => {
          return {
            votingWeight: vp.vp,
            votingWeightByStrategy: vp.vp_by_strategy,
            votingState: vp.vp_state,
          };
        });

      return queryResult;
    }

    return {
      votingWeight: 0,
      votingWeightByStrategy: [0],
      votingState: '',
    };
  }, [address, daoSnapshotURL, snapshotProposal?.snapshotProposalId]);

  return {
    loadVotingWeight,
    loadProposal,
    snapshotProposal,
    isSnapshotProposal,
  };
}
