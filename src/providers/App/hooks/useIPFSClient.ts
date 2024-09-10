import axios from 'axios';
import { useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';

const INFURA_AUTH =
  'Basic ' +
  Buffer.from(
    `${import.meta.env.VITE_APP_INFURA_IPFS_API_KEY}:${import.meta.env.VITE_APP_INFURA_IPFS_API_SECRET}`,
  ).toString('base64');
const BASE_URL = 'https://ipfs.infura.io:5001/api/v0';

const axiosClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: INFURA_AUTH } });

export default function useIPFSClient() {
  const cat = useCallback(async (hash: string) => {
    return axiosClient
      .post(`${BASE_URL}/cat?arg=${hash}`)
      .then(response => response.data)
      .catch(error => {
        console.error(error);
        toast('Error fetching data from IPFS, please try again later.');
      });
  }, []);

  const add = useCallback(async (data: string) => {
    const formData = new FormData();
    formData.append('file', data);

    return axiosClient
      .post(`${BASE_URL}/add`, formData)
      .then(response => response.data)
      .catch(error => {
        console.error(error);
        toast('Error saving data to IPFS, please try again later.');
      });
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
