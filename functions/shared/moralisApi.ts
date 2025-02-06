import { toHex } from 'viem';

export interface MoralisResponse<T> {
  status?: string;
  cursor: string | null;
  page: number;
  page_size: number;
  result: T[];
}

interface MoralisRequestConfig {
  endpoint: string;
  chain: string;
  apiKey: string;
  params?: Record<string, string>;
  isPaginated?: boolean;
}

export async function fetchMoralis<T>({
  endpoint,
  chain,
  apiKey,
  params = {},
  isPaginated = true,
}: MoralisRequestConfig): Promise<T[]> {
  let allResults: T[] = [];
  let cursor: string | null = null;
  const limit = 100;

  do {
    const chainHex = toHex(parseInt(chain));
    const url = new URL(`https://deep-index.moralis.io/api/v2.2${endpoint}`);

    // Add chain parameter
    url.searchParams.append('chain', chainHex);

    // Add cursor and limit only for paginated endpoints
    if (isPaginated) {
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }
      url.searchParams.append('limit', limit.toString());
    }

    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'x-api-key': apiKey,
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle paginated vs non-paginated responses
    if (isPaginated) {
      const paginatedData = data as MoralisResponse<T>;
      if (!paginatedData || !paginatedData.result) break;
      allResults = allResults.concat(paginatedData.result);
      cursor = paginatedData.cursor;
    } else {
      // For non-paginated endpoints, data is the direct array
      return Array.isArray(data) ? data : [];
    }
  } while (cursor !== null && isPaginated);

  return allResults;
}

// Thin wrapper for DeFi-specific endpoints which don't use pagination
export async function fetchMoralisDefi<T>(config: MoralisRequestConfig): Promise<T[]> {
  return fetchMoralis<T>({ ...config, isPaginated: false });
}
