import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import glow from '../../assets/images/bg-glow-top-left.png';

export const WEB3_MODAL_CONFIG = {
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.REACT_APP_INFURA_API_KEY,
      },
    },
    'custom-localprovider': {
      display: {
        logo: glow,
        name: 'Local Node',
        description: 'Connects as Signer to local provider',
      },
      package: !!process.env.REACT_APP_LOCAL_PROVIDER_URL,
      connector: async () => {
        const localProvider = new ethers.providers.JsonRpcProvider(
          process.env.REACT_APP_LOCAL_PROVIDER_URL
        );
        const network = await localProvider.detectNetwork().catch();
        if (!network) {
          return { chainId: '' };
        }
        return { ...localProvider, ...network };
      },
    },
  },
  theme: {
    background: 'none',
    main: 'none',
    secondary: 'none',
    border: 'none',
    hover: 'none',
  },
};
