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
}

export async function fetchMoralis<T>({
  endpoint,
  chain,
  apiKey,
  params = {},
}: MoralisRequestConfig): Promise<T[]> {
  let allResults: T[] = [];
  let cursor: string | null = null;
  const limit = 100;

  do {
    const chainHex = toHex(parseInt(chain));
    const url = new URL(`https://deep-index.moralis.io/api/v2.2${endpoint}`);

    // Add chain parameter
    url.searchParams.append('chain', chainHex);

    // Add cursor if available
    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    // Add limit
    url.searchParams.append('limit', limit.toString());

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

    const data: MoralisResponse<T> = await response.json();

    // Handle no results
    if (!data || !data.result) {
      break;
    }

    allResults = allResults.concat(data.result);
    cursor = data.cursor;
  } while (cursor !== null);

  return allResults;
}
