import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { ActivityEventType, FractalProposalState } from '../../../types';
import { SnapshotProposal } from '../../../types/daoProposal';

const client = new ApolloClient({
  uri: 'https://testnet.snapshot.org/graphql',
  cache: new InMemoryCache(),
});

export const useSnapshotProposals = () => {
  const {
    node: { daoSnapshotURL },
    action,
  } = useFractal();
  const currentSnapshotURL = useRef<string | undefined>();

  const loadSnapshotProposals = useCallback(async () => {
    console.log('loading snapshot proposals, ', daoSnapshotURL);

    client
      .query({
        query: gql`
      query Proposals {
        proposals(
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
        console.log('snapshot query result: ', result);
        const proposals: SnapshotProposal[] = result.data.proposals.map((proposal: any) => {
          return {
            eventDate: new Date(proposal.start * 1000),
            eventType: ActivityEventType.Governance,
            // transaction?: ActivityTransactionType;
            // transactionHash?: string | null;
            state:
              proposal.state === 'active'
                ? FractalProposalState.ACTIVE
                : FractalProposalState.CLOSED,
            proposalId: proposal.id,
            snapshotProposalId: proposal.id,
            targets: [],
            // metaData?: ProposalMetaData;
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
