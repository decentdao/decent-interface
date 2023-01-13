import { Chain, Wallet } from '@rainbow-me/rainbowkit';
import { providers } from 'ethers';
import { MockConnector } from 'wagmi/connectors/mock';
import coinImage from '../../assets/images/coin-icon-default.svg';
export interface MyWalletOptions {
  chains: Chain[];
}
export const testWallet = ({ chains }: MyWalletOptions): Wallet => ({
  id: 'test-wallet',
  name: 'Local Node Wallet',
  iconUrl: coinImage,
  iconBackground: '#0c2f78',
  downloadUrls: {},
  createConnector: () => {
    const connector = new MockConnector({
      chains,
      options: {
        signer: new providers.JsonRpcProvider().getSigner(),
      },
    });
    return {
      connector,
    };
  },
});
