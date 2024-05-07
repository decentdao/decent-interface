import Azorius from '@fractal-framework/fractal-contracts/deployments/sepolia/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/sepolia/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/sepolia/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/sepolia/ERC20FreezeVoting.json';
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/sepolia/ERC721FreezeVoting.json';
import FractalModule from '@fractal-framework/fractal-contracts/deployments/sepolia/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/sepolia/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/sepolia/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/sepolia/LinearERC20Voting.json';
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/sepolia/LinearERC721Voting.json';
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/sepolia/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/sepolia/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/sepolia/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/sepolia/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/sepolia/VotesERC20Wrapper.json';
import {
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { getAddress } from 'viem';
import { sepolia } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const chain = sepolia;

export const sepoliaConfig: NetworkConfig = {
  order: 30,
  chain,
  rpcEndpoint: `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_SEPOLIA_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-sepolia.safe.global',
  etherscanBaseURL: 'https://sepolia.etherscan.io',
  etherscanAPIUrl: `https://api-sepolia.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_SEPOLIA_API_KEY}`,
  addressPrefix: 'sep',
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-sepolia',
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
