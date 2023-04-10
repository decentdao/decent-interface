'use client';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphApolloLink } from '@graphprotocol/client-apollo';
import * as GraphClient from '../../.graphclient';

const graphQLClient = new ApolloClient({
  link: new GraphApolloLink(GraphClient),
  cache: new InMemoryCache(),
});

export default graphQLClient;
