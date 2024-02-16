import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';

import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { config, projectId } from './NetworkConfig/web3modal-config';

const queryClient = new QueryClient();

export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  defaultChain: sepolia,
  projectId: projectId,
  themeMode: 'dark',
  enableAnalytics: false,
});

function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3ModalProvider;
