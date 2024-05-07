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
import { getAddress, zeroAddress } from 'viem';
import { mainnet } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const chain = mainnet;

export const mainnetConfig: NetworkConfig = {
  order: 0,
  chain,
  rpcEndpoint: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_MAINNET_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  etherscanBaseURL: 'https://etherscan.io',
  etherscanAPIUrl: `https://api.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_MAINNET_API_KEY}`,
  addressPrefix: 'eth',
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-mainnet',
    version: 'v0.0.2',
  },
  contracts: {
    fractalAzoriusMasterCopy: getAddress(Azorius.address),
    fractalModuleMasterCopy: getAddress(FractalModule.address),
    fractalRegistry: getAddress(FractalRegistry.address),
    votesERC20MasterCopy: getAddress(VotesERC20.address),
    linearVotingERC721MasterCopy: zeroAddress, // TODO - Add actual address once contract is deployed on mainnet
    claimingMasterCopy: getAddress(ERC20Claim.address),
    azoriusFreezeGuardMasterCopy: getAddress(AzoriusFreezeGuard.address),
    multisigFreezeVotingMasterCopy: getAddress(MultisigFreezeVoting.address),
    erc20FreezeVotingMasterCopy: getAddress(ERC20FreezeVoting.address),
    erc721FreezeVotingMasterCopy: zeroAddress, // TODO - Add actual address once contract is deployed on mainnet
    multisigFreezeGuardMasterCopy: getAddress(MultisigFreezeGuard.address),
    fallbackHandler: getAddress(
      getCompatibilityFallbackHandlerDeployment({
        version: SAFE_VERSION,
        network: chain.id.toString(),
      })?.networkAddresses[chain.id.toString()]!,
    ),
    safe: getAddress(
      getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: chain.id.toString() })
        ?.networkAddresses[chain.id.toString()]!,
    ),
    safeFactory: getAddress(
      getProxyFactoryDeployment({
        version: SAFE_VERSION,
        network: chain.id.toString(),
      })?.networkAddresses[chain.id.toString()]!,
    ),
    zodiacModuleProxyFactory: getAddress(ModuleProxyFactory.address),
    linearVotingMasterCopy: getAddress(LinearERC20Voting.address),
    multisend: getAddress(
      getMultiSendCallOnlyDeployment({
        version: SAFE_VERSION,
        network: chain.id.toString(),
      })?.networkAddresses[chain.id.toString()]!,
    ),
    votesERC20WrapperMasterCopy: getAddress(VotesERC20Wrapper.address),
    keyValuePairs: getAddress(KeyValuePairs.address),
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
