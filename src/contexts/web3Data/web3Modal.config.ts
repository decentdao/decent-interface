import WalletConnectProvider from '@walletconnect/ethereum-provider';

export const WEB3_MODAL_CONFIG = {
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.REACT_APP_INFURA_API_KEY,
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
