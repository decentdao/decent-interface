import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';

export const useSnapshotProposals = () => {
  const {
    node: { daoSnapshotURL },
  } = useFractal();

  const loadSnapshotProposals = useCallback(async () => {
    console.log('loading snapshot proposals, ', daoSnapshotURL);
    const client = new ApolloClient({
      uri: 'https://testnet.snapshot.org/graphql',
      cache: new InMemoryCache(),
    });

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
      .then(result => console.log(result));
    // @todo: add dispatch
  }, [daoSnapshotURL]);

  return loadSnapshotProposals;
};
