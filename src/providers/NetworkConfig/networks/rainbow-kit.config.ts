import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, goerli } from 'wagmi';
import { localhost } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

export const chainsArr = [goerli];

// allows connection to localhost only in development mode.
if (process.env.NODE_ENV === 'development') {
  chainsArr.push(localhost);
}

export const { chains, provider } = configureChains(chainsArr, [
  alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID! }),
  infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID! }),
  publicProvider(),
]);

const { connectors } = getDefaultWallets({
  appName: 'Fractal',
  // @todo add more app details here, including disclaimer, and description
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
