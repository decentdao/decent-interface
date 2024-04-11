import Azorius from '@fractal-framework/fractal-contracts/deployments/mainnet/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/mainnet/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20FreezeVoting.json';

import FractalModule from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/mainnet/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/mainnet/LinearERC20Voting.json';

import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/mainnet/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20Wrapper.json';
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { mainnet } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const CHAIN_ID = 1;
const SAFE_VERSION = '1.3.0';

export const mainnetConfig: NetworkConfig = {
  order: 0,
  chain: mainnet,
  rpcEndpoint: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_MAINNET_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  etherscanBaseURL: 'https://etherscan.io',
  etherscanAPIUrl: `https://api.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_MAINNET_API_KEY}`,
  chainId: CHAIN_ID,
  name: mainnet.name,
  addressPrefix: 'eth',
  nativeTokenSymbol: mainnet.nativeCurrency.symbol,
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  wagmiChain: mainnet,
  subgraph: {
    space: 71032,
    slug: 'fractal-mainnet',
    version: 'v0.0.1',
  },
  contracts: {
    fractalAzoriusMasterCopy: Azorius.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesERC20MasterCopy: VotesERC20.address,
    linearVotingERC721MasterCopy: '', // TODO - Add actual address once contract is deployed on mainnet
    claimingMasterCopy: ERC20Claim.address,
    azoriusFreezeGuardMasterCopy: AzoriusFreezeGuard.address,
    multisigFreezeVotingMasterCopy: MultisigFreezeVoting.address,
    erc20FreezeVotingMasterCopy: ERC20FreezeVoting.address,
    erc721FreezeVotingMasterCopy: '', // TODO - Add actual address once contract is deployed on mainnet
    multisigFreezeGuardMasterCopy: MultisigFreezeGuard.address,
    fallbackHandler: getCompatibilityFallbackHandlerDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.networkAddresses[CHAIN_ID.toString()]!,
    safe: getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: CHAIN_ID.toString() })
      ?.networkAddresses[CHAIN_ID.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.networkAddresses[CHAIN_ID.toString()]!,
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.networkAddresses[CHAIN_ID.toString()]!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
  },
  staking: {
    lido: {
      rewardsAddress: '0x8202E3cBa328CCf3eeA5bF0A11596c5297Cf7525',
      stETHContractAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      withdrawalQueueContractAddress: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
    },
  },
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};
