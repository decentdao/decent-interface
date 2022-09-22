require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: "0.8.4",
  networks: { 
    hardhat: {
      chainId: 31337,
      forking: {
        url: `https://eth-goerli.g.alchemy.com/v2/${process.env.TESTING_ALCHEMY_API_KEY}`
      }
    },
  },
};
