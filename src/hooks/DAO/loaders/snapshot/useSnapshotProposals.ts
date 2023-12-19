import { gql } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ActivityEventType, FractalProposalState } from '../../../../types';
import { SnapshotProposal } from '../../../../types/daoProposal';
import useSnapshotSpaceName from './useSnapshotSpaceName';
import { createClient } from './';

export const useSnapshotProposals = () => {
  const {
    node: { daoSnapshotURL },
    action,
  } = useFractal();
  const daoSnapshotSpaceName = useSnapshotSpaceName();
  const currentSnapshotURL = useRef<string | undefined>();
  const client = useMemo(() => {
    if (daoSnapshotURL) {
      return createClient(daoSnapshotURL);
    }
  }, [daoSnapshotURL]);

  const loadSnapshotProposals = useCallback(async () => {
    if (client) {
      client
        .query({
          query: gql`
      query Proposals {
        proposals(
          where: {
            space_in: ["${daoSnapshotSpaceName}"]
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
              eventType: ActivityEventType.Governance,
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
            };
          });

          action.dispatch({
            type: FractalGovernanceAction.SET_SNAPSHOT_PROPOSALS,
            payload: proposals,
          });
        });
    }
  }, [action, daoSnapshotSpaceName, client]);

  useEffect(() => {
    if (!daoSnapshotSpaceName || daoSnapshotSpaceName === currentSnapshotURL.current) return;
    currentSnapshotURL.current = daoSnapshotSpaceName;
    loadSnapshotProposals();
  }, [daoSnapshotSpaceName, loadSnapshotProposals]);
};
