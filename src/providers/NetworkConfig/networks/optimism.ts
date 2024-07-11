import Azorius from '@fractal-framework/fractal-contracts/deployments/optimism/Azorius.json' assert { type: 'json' };
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/optimism/AzoriusFreezeGuard.json' assert { type: 'json' };
import DecentHats from '@fractal-framework/fractal-contracts/deployments/optimism/DecentHats_0_1_0.json' assert { type: 'json' };
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/optimism/ERC20Claim.json' assert { type: 'json' };
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/optimism/ERC20FreezeVoting.json' assert { type: 'json' };
import ERC721FreezeVoting from '@fractal-framework/fractal-contracts/deployments/optimism/ERC721FreezeVoting.json' assert { type: 'json' };
import FractalModule from '@fractal-framework/fractal-contracts/deployments/optimism/FractalModule.json' assert { type: 'json' };
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/optimism/FractalRegistry.json' assert { type: 'json' };
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/optimism/KeyValuePairs.json' assert { type: 'json' };
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/optimism/LinearERC20Voting.json' assert { type: 'json' };
import LinearVotingERC721 from '@fractal-framework/fractal-contracts/deployments/optimism/LinearERC721Voting.json' assert { type: 'json' };
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/optimism/ModuleProxyFactory.json' assert { type: 'json' };
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/optimism/MultisigFreezeGuard.json' assert { type: 'json' };
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/optimism/MultisigFreezeVoting.json' assert { type: 'json' };
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/optimism/VotesERC20.json' assert { type: 'json' };
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/optimism/VotesERC20Wrapper.json' assert { type: 'json' };
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { optimism } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';

const SAFE_VERSION = '1.3.0';

const optimismConfig: NetworkConfig = {
  order: 15,
  chain: optimism,
  moralisSupported: true,
  rpcEndpoint: `https://opt-mainnet.g.alchemy.com/v2/${import.meta.env?.VITE_APP_ALCHEMY_OPTIMISM_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-optimism.safe.global',
  etherscanBaseURL: 'https://optimistic.etherscan.io/',
  etherscanAPIUrl: `https://api-optimistic.etherscan.io/api?apikey=${import.meta.env?.VITE_APP_ETHERSCAN_OPTIMISM_API_KEY}`,
  addressPrefix: 'oeth',
  nativeTokenIcon: '/images/coin-icon-op.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-optimism',
    version: 'v0.1.1',
  },
  sablierSubgraph: {
    space: 57079,
    slug: 'sablier-v2-optimism',
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
      network: optimism.id.toString(),
    })?.networkAddresses[optimism.id.toString()]!,
    safe: getSafeL2SingletonDeployment({ version: SAFE_VERSION, network: optimism.id.toString() })
      ?.networkAddresses[optimism.id.toString()]!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: optimism.id.toString(),
    })?.networkAddresses[optimism.id.toString()]!,
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: optimism.id.toString(),
    })?.networkAddresses[optimism.id.toString()]!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
    decentHatsMasterCopy: DecentHats.address,
    hatsProtocol: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
    erc6551Registry: '0x000000006551c19487814612e58FE06813775758',
    hatsAccount1ofNMasterCopy: '0xfEf83A660b7C10a3EdaFdCF62DEee1fD8a875D29',
    sablierV2Batch: '0x6cd7bB0f63aFCc9F6CeDd1Bf1E3Bd4ED078CD019',
    sablierV2LockupDynamic: '0x4994325F8D4B4A36Bd643128BEb3EC3e582192C0',
    sablierV2LockupTranched: '0x90952912a50079bef00D5F49c975058d6573aCdC'
  },
  staking: {},
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};

export default optimismConfig;
