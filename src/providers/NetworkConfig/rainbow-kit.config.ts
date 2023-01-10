import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, createStorage, goerli } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

export const chainsArr = [goerli];

// allows connection to localhost only in development mode.
if (process.env.NODE_ENV === 'development') {
  chainsArr.push(hardhat);
}

export const { chains, provider } = configureChains(chainsArr, [
  infuraProvider({ priority: 0, apiKey: process.env.REACT_APP_INFURA_ID! }),
  alchemyProvider({ priority: 1, apiKey: process.env.REACT_APP_ALCHEMY_ID! }),
  publicProvider({ priority: 2 }),
]);

const { connectors } = getDefaultWallets({
  appName: 'Fractal',
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  storage: createStorage({ storage: window.localStorage }),
  connectors,
  provider,
});
