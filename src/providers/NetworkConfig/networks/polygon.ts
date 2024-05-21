import Azorius from '@fractal-framework/fractal-contracts/deployments/polygon/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/polygon/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/polygon/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/polygon/ERC20FreezeVoting.json';

import FractalModule from '@fractal-framework/fractal-contracts/deployments/polygon/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/polygon/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/polygon/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/polygon/LinearERC20Voting.json';

import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/polygon/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/polygon/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/polygon/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/polygon/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/polygon/VotesERC20Wrapper.json';
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { polygon } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

export const polygonConfig: NetworkConfig = {
  order: 20,
  chain: polygon,
  rpcEndpoint: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_POLYGON_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-polygon.safe.global',
  etherscanBaseURL: 'https://polygonscan.com',
  etherscanAPIUrl: `https://api.polygonscan.com/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_POLYGON_API_KEY}`,
  addressPrefix: 'matic',
  nativeTokenIcon: '/images/coin-icon-pol.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-base-polygon',
    version: 'v0.1.1',
  },
  contracts: {
    fractalAzoriusMasterCopy: Azorius.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesERC20MasterCopy: VotesERC20.address,
    linearVotingERC721MasterCopy: '', // TODO - Add actual address once contract is deployed on polygon
    claimingMasterCopy: ERC20Claim.address,
    azoriusFreezeGuardMasterCopy: AzoriusFreezeGuard.address,
    multisigFreezeVotingMasterCopy: MultisigFreezeVoting.address,
    erc20FreezeVotingMasterCopy: ERC20FreezeVoting.address,
    erc721FreezeVotingMasterCopy: '', // TODO - Add actual address once contract is deployed on polygon
    multisigFreezeGuardMasterCopy: MultisigFreezeGuard.address,
    fallbackHandler: getCompatibilityFallbackHandlerDeployment({
      version: SAFE_VERSION,
      network: polygon.id.toString(),
    })?.networkAddresses[polygon.id.toString()]!,
    safe: getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: polygon.id.toString() })
      ?.networkAddresses[polygon.id.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: polygon.id.toString(),
    })?.networkAddresses[polygon.id.toString()]!,
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: polygon.id.toString(),
    })?.networkAddresses[polygon.id.toString()]!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
  },
  staking: {},
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};
