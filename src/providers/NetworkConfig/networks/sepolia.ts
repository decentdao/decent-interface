import deployments from '@fractal-framework/fractal-contracts/deployments';
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
import { getSafeContractDeployment } from './utils';

const SAFE_VERSION = '1.3.0';

const chain = sepolia;
const contracts = deployments[chain.id][0].contracts;

export const sepoliaConfig: NetworkConfig = {
  order: 30,
  chain,
  rpcEndpoint: `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_SEPOLIA_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-sepolia.safe.global',
  etherscanBaseURL: 'https://sepolia.etherscan.io',
  etherscanAPIUrl: `https://api-sepolia.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_SEPOLIA_API_KEY}`,
  addressPrefix: 'sep',
  nativeTokenIcon: '/images/coin-icon-sep.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-sepolia',
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

    zodiacModuleProxyFactory: getAddress(contracts.ModuleProxyFactory.address),

    linearVotingErc20MasterCopy: getAddress(contracts.LinearERC20Voting.address),
    linearVotingErc721MasterCopy: getAddress(contracts.LinearERC721Voting.address),

    moduleAzoriusMasterCopy: getAddress(contracts.Azorius.address),
    moduleFractalMasterCopy: getAddress(contracts.FractalModule.address),

    freezeGuardAzoriusMasterCopy: getAddress(contracts.AzoriusFreezeGuard.address),
    freezeGuardMultisigMasterCopy: getAddress(contracts.MultisigFreezeGuard.address),

    freezeVotingErc20MasterCopy: getAddress(contracts.ERC20FreezeVoting.address),
    freezeVotingErc721MasterCopy: getAddress(contracts.ERC721FreezeVoting.address),
    freezeVotingMultisigMasterCopy: getAddress(contracts.MultisigFreezeVoting.address),

    votesErc20MasterCopy: getAddress(contracts.VotesERC20.address),
    votesErc20WrapperMasterCopy: getAddress(contracts.VotesERC20Wrapper.address),

    claimErc20MasterCopy: getAddress(contracts.ERC20Claim.address),

    fractalRegistry: getAddress(contracts.FractalRegistry.address),
    keyValuePairs: getAddress(contracts.KeyValuePairs.address),
  },
  staking: {},
  createOptions: [
    GovernanceType.MULTISIG,
    GovernanceType.AZORIUS_ERC20,
    GovernanceType.AZORIUS_ERC721,
  ],
};
