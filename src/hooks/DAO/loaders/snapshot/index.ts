import { cacheExchange, createClient, fetchExchange } from 'urql';

export const createSnapshotGraphQlClient = () =>
  createClient({
    url: 'https://hub.snapshot.org/graphql',
    exchanges: [cacheExchange, fetchExchange],
  });
