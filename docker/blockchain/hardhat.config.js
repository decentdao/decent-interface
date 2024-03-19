require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.4',
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_TESTING_API_KEY}`,
      },
    },
  },
};
