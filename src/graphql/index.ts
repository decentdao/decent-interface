import { cacheExchange, createClient, fetchExchange } from 'urql';

const subgraphSpace = import.meta.env.VITE_DECENT_SUBGRAPH_SPACE;
const subgraphSlug = import.meta.env.VITE_DECENT_SUBGRAPH_SLUG;
const subgraphVersion = import.meta.env.VITE_DECENT_SUBGRAPH_VERSION;

const subgraphAPIKey = import.meta.env.VITE_DECENT_SUBGRAPH_API_KEY;
const subgraphID = import.meta.env.VITE_DECENT_SUBGRAPH_ID;

const DECNT_SUBGRAPH_ENDPOINT_DEV = `https://api.studio.thegraph.com/query/${subgraphSpace}/${subgraphSlug}/${subgraphVersion}`;
const DECNT_SUBGRAPH_ENDPOINT_PROD = `https://gateway.thegraph.com/api/${subgraphAPIKey}/subgraphs/id/${subgraphID}`;

const client = createClient({
  url: DECNT_SUBGRAPH_ENDPOINT_DEV,
  exchanges: [cacheExchange, fetchExchange],
});

export default client;
