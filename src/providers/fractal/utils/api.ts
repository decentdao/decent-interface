import { getChainMetadataById } from '../../../contexts/web3Data/chains';

/**
 * builds url for gnosis api requests
 * @param chainId current chain id
 * @param pathname gnosis path name for request
 * @param queryParams object for requests
 * @param version gnosis api version (default: v1)
 * @url https://safe-transaction.[network].gnosis.io/
 * @returns
 */
export const buildGnosisApiUrl = (
  chainId: number,
  pathname: string,
  queryParams: { [key: string]: string } = {},
  version: 'v1' | 'v2' = 'v1'
) => {
  const chainIdName = getChainMetadataById(chainId)!.name;
  const GNOSIS_URL = `https://safe-transaction.${chainIdName}.gnosis.io/api/${version}`;
  if (!Object.keys(queryParams).length) {
    return `${GNOSIS_URL}${pathname}`;
  }
  const query = new URLSearchParams({ ...queryParams });
  return `${GNOSIS_URL}${pathname}?${query}`;
};
