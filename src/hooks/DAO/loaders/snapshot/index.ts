import { ApolloClient, InMemoryCache, DefaultOptions } from '@apollo/client';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

export const createClient = () =>
  new ApolloClient({
    uri: 'https://hub.snapshot.org/graphql',
    cache: new InMemoryCache(),
    defaultOptions,
  });
