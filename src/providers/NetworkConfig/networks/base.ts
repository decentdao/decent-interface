import Azorius from '@fractal-framework/fractal-contracts/deployments/base/Azorius.json' assert { type: 'json' };
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/base/AzoriusFreezeGuard.json' assert { type: 'json' };
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/base/ERC20Claim.json' assert { type: 'json' };
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/base/ERC20FreezeVoting.json' assert { type: 'json' };
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/base/ERC721FreezeVoting.json' assert { type: 'json' };
import FractalModule from '@fractal-framework/fractal-contracts/deployments/base/FractalModule.json' assert { type: 'json' };
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/base/FractalRegistry.json' assert { type: 'json' };
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/base/KeyValuePairs.json' assert { type: 'json' };
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/base/LinearERC20Voting.json' assert { type: 'json' };
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/base/LinearERC721Voting.json' assert { type: 'json' };
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/base/ModuleProxyFactory.json' assert { type: 'json' };
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/base/MultisigFreezeGuard.json' assert { type: 'json' };
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/base/MultisigFreezeVoting.json' assert { type: 'json' };
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/base/VotesERC20.json' assert { type: 'json' };
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/base/VotesERC20Wrapper.json' assert { type: 'json' };
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { base } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

export const baseConfig: NetworkConfig = {
  order: 10,
  chain: base,
  moralisSupported: true,
  rpcEndpoint: `https://base-mainnet.g.alchemy.com/v2/${import.meta.env?.VITE_APP_ALCHEMY_BASE_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-base.safe.global',
  etherscanBaseURL: 'https://basescan.org/',
  etherscanAPIUrl: `https://api.basescan.com/api?apikey=${import.meta.env?.VITE_APP_ETHERSCAN_BASE_API_KEY}`,
  addressPrefix: 'base',
  nativeTokenIcon: '/images/coin-icon-base.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-base',
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
      network: base.id.toString(),
    })?.networkAddresses[base.id.toString()]!,
    safe: getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: base.id.toString() })
      ?.networkAddresses[base.id.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: base.id.toString(),
    })?.networkAddresses[base.id.toString()]!,
    zodiacModuleProxyFactory: '0x000000000000aDdB49795b0f9bA5BC298cDda236',
    zodiacModuleProxyFactoryOld: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: base.id.toString(),
    })?.networkAddresses[base.id.toString()]!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
  },
  staking: {},
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};
