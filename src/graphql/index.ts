import { cacheExchange, createClient, fetchExchange } from 'urql';
import { NetworkConfig, SubgraphConfig } from '../types/network';

const createSubgraphClient = (config: SubgraphConfig) => {
  const subgraphAPIKey = import.meta.env.VITE_APP_SUBGRAPH_API_KEY;

  const url = import.meta.env.DEV
    ? `https://api.studio.thegraph.com/query/${config.space}/${config.slug}/${config.version}`
    : `https://gateway.thegraph.com/api/${subgraphAPIKey}/subgraphs/id/${config.id}`;

  return createClient({
    url,
    exchanges: [cacheExchange, fetchExchange],
  });
};

export const createDecentGraphClient = (networkConfig: NetworkConfig) => {
  return createSubgraphClient(networkConfig.subgraph);
};

export const createSablierGraphClient = (networkConfig: NetworkConfig) => {
  return createSubgraphClient(networkConfig.sablierSubgraph);
};
