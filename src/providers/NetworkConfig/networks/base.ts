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
import { getAddress } from 'viem';
import { base } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const chain = base;

export const baseConfig: NetworkConfig = {
  order: 10,
  chain,
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
