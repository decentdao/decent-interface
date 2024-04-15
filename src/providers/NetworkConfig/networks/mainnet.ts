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
import { Abi, Address } from 'viem';
import { mainnet } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const fallbackHandler = getCompatibilityFallbackHandlerDeployment({
  version: SAFE_VERSION,
  network: mainnet.id.toString(),
})!;
const safe = getSafeL2SingletonDeployment({
  version: SAFE_VERSION,
  network: mainnet.id.toString(),
})!;
const safeFactory = getProxyFactoryDeployment({
  version: SAFE_VERSION,
  network: mainnet.id.toString(),
})!;
const multiSendCallOnly = getMultiSendCallOnlyDeployment({
  version: SAFE_VERSION,
  network: mainnet.id.toString(),
})!;

export const mainnetConfig: NetworkConfig = {
  order: 0,
  chain: mainnet,
  rpcEndpoint: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_MAINNET_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  etherscanBaseURL: 'https://etherscan.io',
  etherscanAPIUrl: `https://api.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_MAINNET_API_KEY}`,
  addressPrefix: 'eth',
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-mainnet',
    version: 'v0.0.1',
  },
  contracts: {
    fractalAzoriusMasterCopy: { address: Azorius.address as Address, abi: Azorius.abi as Abi },
    fractalModuleMasterCopy: {
      address: FractalModule.address as Address,
      abi: FractalModule.abi as Abi,
    },
    fractalRegistry: {
      address: FractalRegistry.address as Address,
      abi: FractalRegistry.abi as Abi,
    },
    votesERC20MasterCopy: { address: VotesERC20.address as Address, abi: VotesERC20.abi as Abi },
    claimingMasterCopy: { address: ERC20Claim.address as Address, abi: ERC20Claim.abi as Abi },
    azoriusFreezeGuardMasterCopy: {
      address: AzoriusFreezeGuard.address as Address,
      abi: AzoriusFreezeGuard.abi as Abi,
    },
    multisigFreezeVotingMasterCopy: {
      address: MultisigFreezeVoting.address as Address,
      abi: MultisigFreezeVoting.abi as Abi,
    },
    erc20FreezeVotingMasterCopy: {
      address: ERC20FreezeVoting.address as Address,
      abi: ERC20FreezeVoting.abi as Abi,
    },
    multisigFreezeGuardMasterCopy: {
      address: MultisigFreezeGuard.address as Address,
      abi: MultisigFreezeGuard.abi as Abi,
    },
    fallbackHandler: {
      address: fallbackHandler.networkAddresses[mainnet.id.toString()]! as Address,
      abi: fallbackHandler.abi as Abi,
    },
    safe: {
      address: safe.networkAddresses[mainnet.id.toString()]! as Address,
      abi: safe.abi as Abi,
    },
    safeFactory: {
      address: safeFactory.networkAddresses[mainnet.id.toString()] as Address,
      abi: safeFactory.abi as Abi,
    },
    zodiacModuleProxyFactory: {
      address: ModuleProxyFactory.address as Address,
      abi: ModuleProxyFactory.abi as Abi,
    },
    linearVotingMasterCopy: {
      address: LinearERC20Voting.address as Address,
      abi: LinearERC20Voting.abi as Abi,
    },
    multisend: {
      address: multiSendCallOnly.networkAddresses[mainnet.id.toString()]! as Address,
      abi: multiSendCallOnly.abi as Abi,
    },
    votesERC20WrapperMasterCopy: {
      address: VotesERC20Wrapper.address as Address,
      abi: VotesERC20Wrapper.abi as Abi,
    },
    keyValuePairs: { address: KeyValuePairs.address as Address, abi: KeyValuePairs.abi as Abi },
  },
  staking: {
    lido: {
      rewardsAddress: { address: '0x8202E3cBa328CCf3eeA5bF0A11596c5297Cf7525' },
      stETHContractAddress: { address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84' },
      withdrawalQueueContractAddress: { address: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1' },
    },
  },
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};
