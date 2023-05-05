import { create } from 'ipfs-http-client';

export default function useIPFSClient() {
  const auth =
    'Basic ' +
    Buffer.from(
      `${process.env.NEXT_PUBLIC_INFURA_PROJECT_API_KEY}:${process.env.NEXT_PUBLIC_INFURA_PROJECT_API_SECRET}`
    ).toString('base64');

  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  return client;
}
