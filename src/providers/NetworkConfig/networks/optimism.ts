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
import { getSafeContractDeployment } from './utils';

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
    gnosisSafeL2Singleton: getSafeContractDeployment(
      getSafeL2SingletonDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    gnosisSafeProxyFactory: getSafeContractDeployment(
      getProxyFactoryDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    compatibilityFallbackHandler: getSafeContractDeployment(
      getCompatibilityFallbackHandlerDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    multiSendCallOnly: getSafeContractDeployment(
      getMultiSendCallOnlyDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),

    zodiacModuleProxyFactory: getAddress(ModuleProxyFactory.address),

    linearVotingErc20MasterCopy: getAddress(LinearERC20Voting.address),
    linearVotingErc721MasterCopy: getAddress(LinearVotingERC721.address),

    moduleAzoriusMasterCopy: getAddress(Azorius.address),
    moduleFractalMasterCopy: getAddress(FractalModule.address),

    freezeGuardAzoriusMasterCopy: getAddress(AzoriusFreezeGuard.address),
    freezeGuardMultisigMasterCopy: getAddress(MultisigFreezeGuard.address),

    freezeVotingErc20MasterCopy: getAddress(ERC20FreezeVoting.address),
    freezeVotingErc721MasterCopy: getAddress(ERC721FreezeVoting.address),
    freezeVotingMultisigMasterCopy: getAddress(MultisigFreezeVoting.address),

    votesErc20MasterCopy: getAddress(VotesERC20.address),
    votesErc20WrapperMasterCopy: getAddress(VotesERC20Wrapper.address),

    claimErc20MasterCopy: getAddress(ERC20Claim.address),

    fractalRegistry: getAddress(FractalRegistry.address),
    keyValuePairs: getAddress(KeyValuePairs.address),
  },
  staking: {},
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};
