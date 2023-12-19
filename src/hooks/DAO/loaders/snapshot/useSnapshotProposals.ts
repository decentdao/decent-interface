import { gql } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ActivityEventType, FractalProposalState } from '../../../../types';
import { SnapshotProposal } from '../../../../types/daoProposal';
import client from './';

export const useSnapshotProposals = () => {
  const {
    node: { daoSnapshotURL },
    action,
  } = useFractal();
  const currentSnapshotURL = useRef<string | undefined>();

  const loadSnapshotProposals = useCallback(async () => {
    client
      .query({
        query: gql`
      query Proposals {
        proposals(
          first: 50,
          where: {
            space_in: ["${daoSnapshotURL}"]
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
  }, [action, daoSnapshotURL]);

  useEffect(() => {
    if (!daoSnapshotURL || daoSnapshotURL === currentSnapshotURL.current) return;
    currentSnapshotURL.current = daoSnapshotURL;
    loadSnapshotProposals();
  }, [daoSnapshotURL, loadSnapshotProposals]);
};
