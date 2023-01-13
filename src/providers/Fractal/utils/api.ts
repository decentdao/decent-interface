type ChainMetadata = {
  name: string;
  id: number;
};

/* We might use something https://github.com/ethereum-lists/chains
 * if number of supported chains would grew up, this should remain sync with SUPPORTED_CHAIN_IDS of both dev site and prod
 */
const CHAINS: ChainMetadata[] = [
  {
    name: 'Mainnet',
    id: 1,
  },
  {
    name: 'Goerli',
    id: 5,
  },
  {
    name: 'Local Dev Chain',
    id: Number(process.env.REACT_APP_LOCAL_CHAIN_ID) || 0,
  },
];

export const getChainMetadataById = (id: number): ChainMetadata | undefined => {
  return CHAINS.find(chain => chain.id === id);
};

/**
 * builds url for gnosis api requests
 * @param chainId current chain id
 * @param pathname gnosis path name for request
 * @param queryParams object for requests
 * @param version gnosis api version (default: v1)
 * @url https://safe-transaction-[network].safe.global/
 * @returns
 */
export const buildGnosisApiUrl = (
  chainId: number,
  pathname: string,
  queryParams: { [key: string]: string } = {},
  version: 'v1' | 'v2' = 'v1'
) => {
  const chainIdName = getChainMetadataById(chainId)!.name;
  const GNOSIS_URL = `https://safe-transaction-${chainIdName}.safe.global/api/${version}`;
  if (!Object.keys(queryParams).length) {
    return `${GNOSIS_URL}${pathname}`;
  }
  const query = new URLSearchParams({ ...queryParams });
  return `${GNOSIS_URL}${pathname}?${query}`;
};
