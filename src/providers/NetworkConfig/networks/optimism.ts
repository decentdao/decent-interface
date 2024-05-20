import Azorius from '@fractal-framework/fractal-contracts/deployments/optimism/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/optimism/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/optimism/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/optimism/ERC20FreezeVoting.json';
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/optimism/ERC721FreezeVoting.json';
import FractalModule from '@fractal-framework/fractal-contracts/deployments/optimism/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/optimism/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/optimism/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/optimism/LinearERC20Voting.json';
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/optimism/LinearERC721Voting.json';
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/optimism/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/optimism/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/optimism/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/optimism/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/optimism/VotesERC20Wrapper.json';
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { optimism } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

export const optimismConfig: NetworkConfig = {
  order: 15,
  chain: optimism,
  rpcEndpoint: `https://opt-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_OPTIMISM_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-optimism.safe.global',
  etherscanBaseURL: 'https://optimistic.etherscan.io/',
  etherscanAPIUrl: `https://api-optimistic.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_OPTIMISM_API_KEY}`,
  addressPrefix: 'oeth',
  nativeTokenIcon: '/images/coin-icon-op.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-optimism',
    version: 'v0.0.2',
  },
  contracts: {
    fractalAzoriusMasterCopy: Azorius.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesERC20MasterCopy: VotesERC20.address,
    linearVotingERC721MasterCopy: LinearVotingERC721.address,
    claimingMasterCopy: ERC20Claim.address,
    azoriusFreezeGuardMasterCopy: AzoriusFreezeGuard.address,
    multisigFreezeVotingMasterCopy: MultisigFreezeVoting.address,
    erc20FreezeVotingMasterCopy: ERC20FreezeVoting.address,
    erc721FreezeVotingMasterCopy: ERC721FreezeVoting.address,
    multisigFreezeGuardMasterCopy: MultisigFreezeGuard.address,
    fallbackHandler: getCompatibilityFallbackHandlerDeployment({
      version: SAFE_VERSION,
      network: optimism.id.toString(),
    })?.networkAddresses[optimism.id.toString()]!,
    safe: getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: optimism.id.toString() })
      ?.networkAddresses[optimism.id.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: optimism.id.toString(),
    })?.networkAddresses[optimism.id.toString()]!,
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: optimism.id.toString(),
    })?.networkAddresses[optimism.id.toString()]!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
  },
  staking: {},
  createOptions: [
    GovernanceType.MULTISIG,
    GovernanceType.AZORIUS_ERC20,
    GovernanceType.AZORIUS_ERC721,
  ],
};
