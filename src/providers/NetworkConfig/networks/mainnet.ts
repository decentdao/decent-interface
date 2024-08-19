import Azorius from '@fractal-framework/fractal-contracts/deployments/mainnet/Azorius.json' assert { type: 'json' };
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/mainnet/AzoriusFreezeGuard.json' assert { type: 'json' };
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20Claim.json' assert { type: 'json' };
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20FreezeVoting.json' assert { type: 'json' };
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC721FreezeVoting.json' assert { type: 'json' };
import FractalModule from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalModule.json' assert { type: 'json' };
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalRegistry.json' assert { type: 'json' };
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/mainnet/KeyValuePairs.json' assert { type: 'json' };
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/mainnet/LinearERC20Voting.json' assert { type: 'json' };
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/mainnet/LinearERC721Voting.json' assert { type: 'json' };
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/mainnet/ModuleProxyFactory.json' assert { type: 'json' };
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeGuard.json' assert { type: 'json' };
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeVoting.json' assert { type: 'json' };
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20.json' assert { type: 'json' };
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20Wrapper.json' assert { type: 'json' };
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { mainnet } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

export const mainnetConfig: NetworkConfig = {
  order: 0,
  chain: mainnet,
  moralisSupported: true,
  rpcEndpoint: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env?.VITE_APP_ALCHEMY_MAINNET_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  etherscanBaseURL: 'https://etherscan.io',
  etherscanAPIUrl: `https://api.etherscan.io/api?apikey=${import.meta.env?.VITE_APP_ETHERSCAN_MAINNET_API_KEY}`,
  addressPrefix: 'eth',
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-mainnet',
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
      network: mainnet.id.toString(),
    })?.networkAddresses[mainnet.id.toString()]!,
    safe: getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: mainnet.id.toString() })
      ?.networkAddresses[mainnet.id.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: mainnet.id.toString(),
    })?.networkAddresses[mainnet.id.toString()]!,
    zodiacModuleProxyFactory: '0x000000000000aDdB49795b0f9bA5BC298cDda236',
    zodiacModuleProxyFactoryOld: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: mainnet.id.toString(),
    })?.networkAddresses[mainnet.id.toString()]!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
  },
  staking: {
    lido: {
      rewardsAddress: '0x8202E3cBa328CCf3eeA5bF0A11596c5297Cf7525',
      stETHContractAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      withdrawalQueueContractAddress: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
    },
  },
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};
