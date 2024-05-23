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
import { getAddress } from 'viem';
import { optimism } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const chain = optimism;

export const optimismConfig: NetworkConfig = {
  order: 15,
  chain,
  rpcEndpoint: `https://opt-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_OPTIMISM_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-optimism.safe.global',
  etherscanBaseURL: 'https://optimistic.etherscan.io/',
  etherscanAPIUrl: `https://api-optimistic.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_OPTIMISM_API_KEY}`,
  addressPrefix: 'oeth',
  nativeTokenIcon: '/images/coin-icon-op.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-optimism',
    version: 'v0.1.1',
  },
  contracts: {
    fractalAzoriusMasterCopy: getAddress(Azorius.address),
    fractalModuleMasterCopy: getAddress(FractalModule.address),
    fractalRegistry: getAddress(FractalRegistry.address),
    votesERC20MasterCopy: getAddress(VotesERC20.address),
    linearVotingERC721MasterCopy: getAddress(LinearVotingERC721.address),
    claimingMasterCopy: getAddress(ERC20Claim.address),
    azoriusFreezeGuardMasterCopy: getAddress(AzoriusFreezeGuard.address),
    multisigFreezeVotingMasterCopy: getAddress(MultisigFreezeVoting.address),
    erc20FreezeVotingMasterCopy: getAddress(ERC20FreezeVoting.address),
    erc721FreezeVotingMasterCopy: getAddress(ERC721FreezeVoting.address),
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
  staking: {},
  createOptions: [
    GovernanceType.MULTISIG,
    GovernanceType.AZORIUS_ERC20,
    GovernanceType.AZORIUS_ERC721,
  ],
};
