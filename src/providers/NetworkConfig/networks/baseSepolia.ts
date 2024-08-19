import Azorius from '@fractal-framework/fractal-contracts/deployments/baseSepolia/Azorius.json' assert { type: 'json' };
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/baseSepolia/AzoriusFreezeGuard.json' assert { type: 'json' };
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ERC20Claim.json' assert { type: 'json' };
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ERC20FreezeVoting.json' assert { type: 'json' };
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ERC721FreezeVoting.json' assert { type: 'json' };
import FractalModule from '@fractal-framework/fractal-contracts/deployments/baseSepolia/FractalModule.json' assert { type: 'json' };
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/baseSepolia/FractalRegistry.json' assert { type: 'json' };
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/baseSepolia/KeyValuePairs.json' assert { type: 'json' };
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/LinearERC20Voting.json' assert { type: 'json' };
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/baseSepolia/LinearERC721Voting.json' assert { type: 'json' };
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/baseSepolia/ModuleProxyFactory.json' assert { type: 'json' };
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/baseSepolia/MultisigFreezeGuard.json' assert { type: 'json' };
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/baseSepolia/MultisigFreezeVoting.json' assert { type: 'json' };
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/baseSepolia/VotesERC20.json' assert { type: 'json' };
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/baseSepolia/VotesERC20Wrapper.json' assert { type: 'json' };
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { baseSepolia } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

export const baseSepoliaConfig: NetworkConfig = {
  order: 40,
  chain: baseSepolia,
  moralisSupported: true,
  rpcEndpoint: `https://base-sepolia.g.alchemy.com/v2/${import.meta.env?.VITE_APP_ALCHEMY_BASE_SEPOLIA_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-base-sepolia.safe.global',
  etherscanBaseURL: 'https://sepolia.basescan.org/',
  etherscanAPIUrl: `https://api-sepolia.basescan.com/api?apikey=${import.meta.env?.VITE_APP_ETHERSCAN_BASE_SEPOLIA_API_KEY}`,
  addressPrefix: 'basesep',
  nativeTokenIcon: '/images/coin-icon-base-sep.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-base-sepolia',
    version: 'v0.1.1',
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
      network: baseSepolia.id.toString(),
    })?.networkAddresses[baseSepolia.id.toString()]!,
    safe: getSafeL2SingletonDeployment({
      version: SAFE_VERSION,
      network: baseSepolia.id.toString(),
    })?.networkAddresses[baseSepolia.id.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: baseSepolia.id.toString(),
    })?.networkAddresses[baseSepolia.id.toString()]!,
    zodiacModuleProxyFactory: '0x000000000000aDdB49795b0f9bA5BC298cDda236',
    zodiacModuleProxyFactoryOld: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: baseSepolia.id.toString(),
    })?.networkAddresses[baseSepolia.id.toString()]!,
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
