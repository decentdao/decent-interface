import axios from 'axios';
import { useMemo, useCallback } from 'react';

const INFURA_AUTH =
  'Basic ' +
  Buffer.from(
    `${process.env.NEXT_PUBLIC_INFURA_IPFS_API_KEY}:${process.env.NEXT_PUBLIC_INFURA_IPFS_API_SECRET}`,
  ).toString('base64');
const BASE_URL = 'https://ipfs.infura.io:5001/api/v0';

const axiosClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: INFURA_AUTH } });

export default function useIPFSClient() {
  const cat = useCallback(async (hash: string) => {
    const response = await axiosClient.post(`${BASE_URL}/cat?arg=${hash}`);
    return response.data;
  }, []);

  const add = useCallback(async (data: string) => {
    const formData = new FormData();
    formData.append('file', data);
    const response = await axiosClient.post(`${BASE_URL}/add`, formData);
    return response.data;
  }, []);

  const client = useMemo(
    () => ({
      cat,
      add,
    }),
    [cat, add],
  );

  return client;
}
