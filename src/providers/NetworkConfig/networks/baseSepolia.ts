import Azorius from '@fractal-framework/fractal-contracts/deployments/baseSepolia/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/baseSepolia/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ERC20FreezeVoting.json';
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ERC721FreezeVoting.json';
import FractalModule from '@fractal-framework/fractal-contracts/deployments/baseSepolia/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/baseSepolia/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/baseSepolia/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/LinearERC20Voting.json';
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/baseSepolia/LinearERC721Voting.json';
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/baseSepolia/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/baseSepolia/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/baseSepolia/VotesERC20Wrapper.json';
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { getAddress } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const chain = baseSepolia;

export const baseSepoliaConfig: NetworkConfig = {
  order: 40,
  chain,
  rpcEndpoint: `https://base-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_BASE_SEPOLIA_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-base-sepolia.safe.global',
  etherscanBaseURL: 'https://sepolia.basescan.org/',
  etherscanAPIUrl: `https://api-sepolia.basescan.com/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_BASE_SEPOLIA_API_KEY}`,
  addressPrefix: 'basesep',
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-base-sepolia',
    version: 'v0.0.2',
  },
  contracts: {
    fractalAzoriusMasterCopy: Azorius.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesERC20MasterCopy: getAddress(VotesERC20.address),
    linearVotingERC721MasterCopy: LinearVotingERC721.address,
    claimingMasterCopy: ERC20Claim.address,
    azoriusFreezeGuardMasterCopy: AzoriusFreezeGuard.address,
    multisigFreezeVotingMasterCopy: MultisigFreezeVoting.address,
    erc20FreezeVotingMasterCopy: ERC20FreezeVoting.address,
    erc721FreezeVotingMasterCopy: ERC721FreezeVoting.address,
    multisigFreezeGuardMasterCopy: MultisigFreezeGuard.address,
    fallbackHandler: getCompatibilityFallbackHandlerDeployment({
      version: SAFE_VERSION,
      network: chain.id.toString(),
    })?.networkAddresses[chain.id.toString()]!,
    safe: getSafeL2SingletonDeployment({
      version: SAFE_VERSION,
      network: chain.id.toString(),
    })?.networkAddresses[chain.id.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: chain.id.toString(),
    })?.networkAddresses[chain.id.toString()]!,
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: chain.id.toString(),
    })?.networkAddresses[chain.id.toString()]!,
    votesERC20WrapperMasterCopy: getAddress(VotesERC20Wrapper.address),
    keyValuePairs: getAddress(KeyValuePairs.address),
  },
  staking: {},
  createOptions: [
    GovernanceType.MULTISIG,
    GovernanceType.AZORIUS_ERC20,
    GovernanceType.AZORIUS_ERC721,
  ],
};
