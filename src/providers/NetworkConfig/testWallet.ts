import { providers } from 'ethers';
import { createTestClient, publicActions, walletActions, http } from 'viem';
import { hardhat } from 'viem/chains';
import { MockConnector } from 'wagmi/connectors/mock';
export interface MyWalletOptions {
  chains: any;
}
export const testWallet = ({ chains }: MyWalletOptions): any => ({
  id: 'test-wallet',
  name: 'Local Node Wallet',
  iconUrl: '/images/coin-icon-default.svg',
  iconBackground: '#0c2f78',
  downloadUrls: {},
  createConnector: () => {
    const mockWalletClient = createTestClient({
      account: new providers.JsonRpcProvider().getSigner()._address as any,
      chain: hardhat,
      mode: 'hardhat',
      transport: http(),
    })
      .extend(publicActions)
      .extend(walletActions);
    const connector = new MockConnector({
      chains,
      options: {
        walletClient: mockWalletClient as any,
      },
    });
    return {
      connector,
    };
  },
});
