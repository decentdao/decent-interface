'use client';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { supportedChains } from './NetworkConfigProvider';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;

const metadata = {
  name: 'Fractal',
  description: '',
  url: 'http://localhost', // origin must match your domain & subdomain
  icons: [],
};

const supportedWagmiChains = supportedChains.map(config => config.wagmiChain);
const config = defaultWagmiConfig({
  chains: [supportedWagmiChains[0], ...supportedWagmiChains.slice(1)],
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  transports: {
    [mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    ),
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY}`
    ),
  },
  ssr: true,
});

export { config, projectId };
