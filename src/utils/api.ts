/**
 * builds url for safe api requests
 * @param chainId current chain id
 * @param pathname safe path name for request
 * @param queryParams object for requests
 * @param version safe api version (default: v1)
 * @url https://safe-transaction-[network].safe.global/
 * @returns
 */
export const buildSafeApiUrl = (
  baseUrl: string,
  pathname: string,
  queryParams: { [key: string]: string } = {},
  version: 'v1' | 'v2' = 'v1',
) => {
  const SAFE_URL = `${baseUrl}/api/${version}`;
  if (!Object.keys(queryParams).length) {
    return `${SAFE_URL}${pathname}`;
  }
  const query = new URLSearchParams({ ...queryParams });
  return `${SAFE_URL}${pathname}?${query}`;
};
