import Azorius from '@fractal-framework/fractal-contracts/deployments/base/Azorius.json' assert { type: 'json' };
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/base/AzoriusFreezeGuard.json' assert { type: 'json' };
import DecentHats from '@fractal-framework/fractal-contracts/deployments/base/DecentHats.json' assert { type: 'json ' };
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
import { getAddress } from 'viem';
import { base } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const baseConfig: NetworkConfig = {
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
  sablierSubgraph: {
    space: 57079,
    slug: 'sablier-v2-base',
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
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: base.id.toString(),
    })?.networkAddresses[base.id.toString()]!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
    decentHatsMasterCopy: DecentHats.address,
    hatsProtocol: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
    erc6551Registry: getAddress('0x000000006551c19487814612e58FE06813775758'),
    hatsAccount1ofNMasterCopy: getAddress('0xfEf83A660b7C10a3EdaFdCF62DEee1fD8a875D29'),
  },
  staking: {},
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};

export default baseConfig;
