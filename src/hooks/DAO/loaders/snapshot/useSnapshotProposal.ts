import { gql } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { ExtendedSnapshotProposal, FractalProposal, SnapshotProposal } from '../../../../types';
import client from './';

export default function useSnapshotProposal(proposal: FractalProposal | null | undefined) {
  const [extendedSnapshotProposal, setExtendedSnapshotProposal] =
    useState<ExtendedSnapshotProposal>();
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
  const loadProposal = useCallback(async () => {
    if (snapshotProposal?.snapshotProposalId) {
      const proposalQueryResult = await client
        .query({
          query: gql`
          query ExtendedSnapshotProposal {
            proposal(id: "${snapshotProposal.snapshotProposalId}") {
              snapshot
              type
              quorum
              privacy
              strategies {
                name
                network
                params
              }
              plugins
              choices
              ipfs
            }
          }
        `,
        })
        .then(
          ({
            data: {
              proposal: { snapshot, strategies, plugins, choices, type, quorum, privacy, ipfs },
            },
          }) => {
            return {
              snapshot,
              strategies,
              plugins,
              choices,
              type,
              quorum,
              privacy,
              ipfs,
            };
          }
        );

      const votesQueryResult = await client
        .query({
          query: gql`query SnapshotProposalVotes {
          votes(where: {proposal: "${snapshotProposal.snapshotProposalId}"}) {
            id
            voter
            vp
            vp_by_strategy
            vp_state
            created
            choice
          }
        }`,
        })
        .then(({ data: { votes } }) => {
          return votes.map(({ id, voter, vp, vp_by_strategy, vp_state, created, choice }: any) => ({
            id,
            voter,
            votingWeight: vp,
            votingWeightByStrategy: vp_by_strategy,
            votingState: vp_state,
            created,
            choice,
          }));
        });

      setExtendedSnapshotProposal({
        ...proposal,
        ...proposalQueryResult,
        votes: votesQueryResult,
      } as ExtendedSnapshotProposal);
    }
  }, [snapshotProposal?.snapshotProposalId, proposal]);

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
    extendedSnapshotProposal,
  };
}
