import { gql } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { FractalProposalState, SnapshotProposal } from '../../../../types';
import { createSnapshotGraphQlClient } from './';

export const useSnapshotProposals = () => {
  const {
    node: { daoSnapshotENS },
    action,
  } = useFractal();
  const currentSnapshotENS = useRef<string | undefined>();
  const snaphshotGraphQlClient = useMemo(() => createSnapshotGraphQlClient(), []);

  const loadSnapshotProposals = useCallback(async () => {
    if (snaphshotGraphQlClient) {
      snaphshotGraphQlClient
        .query({
          query: gql`
      query Proposals {
        proposals(
          first: 50,
          where: {
            space_in: ["${daoSnapshotENS}"]
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
        }
      }
      `,
        })
        .then(result => {
          const proposals: SnapshotProposal[] = result.data.proposals.map((proposal: any) => {
            return {
              eventDate: new Date(proposal.start * 1000),
              state:
                proposal.state === 'active'
                  ? FractalProposalState.ACTIVE
                  : proposal.state === 'closed'
                    ? FractalProposalState.CLOSED
                    : FractalProposalState.PENDING,

              proposalId: proposal.id,
              snapshotProposalId: proposal.id,
              targets: [],
              title: proposal.title,
              description: proposal.body,
              startTime: proposal.start,
              endTime: proposal.end,
              author: proposal.author,
            };
          });

          action.dispatch({
            type: FractalGovernanceAction.SET_SNAPSHOT_PROPOSALS,
            payload: proposals,
          });
        });
    }
  }, [action, daoSnapshotENS, snaphshotGraphQlClient]);

  useEffect(() => {
    if (!daoSnapshotENS || daoSnapshotENS === currentSnapshotENS.current) return;
    currentSnapshotENS.current = daoSnapshotENS;
    loadSnapshotProposals();
  }, [daoSnapshotENS, loadSnapshotProposals]);
};
