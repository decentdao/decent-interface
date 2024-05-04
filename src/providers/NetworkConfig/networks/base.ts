import Azorius from '@fractal-framework/fractal-contracts/deployments/base/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/base/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/base/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/base/ERC20FreezeVoting.json';
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/base/ERC721FreezeVoting.json';
import FractalModule from '@fractal-framework/fractal-contracts/deployments/base/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/base/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/base/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/base/LinearERC20Voting.json';
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/base/LinearERC721Voting.json';
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/base/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/base/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/base/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/base/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/base/VotesERC20Wrapper.json';
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { Abi, Address } from 'viem';
import { base } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const fallbackHandler = getCompatibilityFallbackHandlerDeployment({
  version: SAFE_VERSION,
  network: base.id.toString(),
})!;
const safe = getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: base.id.toString() })!;
const safeFactory = getProxyFactoryDeployment({
  version: SAFE_VERSION,
  network: base.id.toString(),
})!;
const multiSendCallOnly = getMultiSendCallOnlyDeployment({
  version: SAFE_VERSION,
  network: base.id.toString(),
})!;

export const baseConfig: NetworkConfig = {
  order: 10,
  chain: base,
  rpcEndpoint: `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_BASE_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-base.safe.global',
  etherscanBaseURL: 'https://basescan.org/',
  etherscanAPIUrl: `https://api.basescan.com/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_BASE_API_KEY}`,
  addressPrefix: 'base',
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-base',
    version: 'v0.0.2',
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
    linearVotingERC721MasterCopy: {
      address: LinearVotingERC721.address as Address,
      abi: LinearVotingERC721.abi as Abi,
    },
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
    erc721FreezeVotingMasterCopy: {
      address: ERC721FreezeVoting.address as Address,
      abi: ERC721FreezeVoting.abi as Abi,
    },
    multisigFreezeGuardMasterCopy: {
      address: MultisigFreezeGuard.address as Address,
      abi: MultisigFreezeGuard.abi as Abi,
    },
    fallbackHandler: {
      address: fallbackHandler.networkAddresses[base.id.toString()]! as Address,
      abi: fallbackHandler.abi as Abi,
    },
    safe: { address: safe.networkAddresses[base.id.toString()]! as Address, abi: safe.abi as Abi },
    safeFactory: {
      address: safeFactory.networkAddresses[base.id.toString()] as Address,
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
      address: multiSendCallOnly.networkAddresses[base.id.toString()]! as Address,
      abi: multiSendCallOnly.abi as Abi,
    },
    votesERC20WrapperMasterCopy: {
      address: VotesERC20Wrapper.address as Address,
      abi: VotesERC20Wrapper.abi as Abi,
    },
    keyValuePairs: { address: KeyValuePairs.address as Address, abi: KeyValuePairs.abi as Abi },
  },
  staking: {},
  createOptions: [
    GovernanceType.MULTISIG,
    GovernanceType.AZORIUS_ERC20,
    GovernanceType.AZORIUS_ERC721,
  ],
};
