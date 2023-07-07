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
  getSafeSingletonDeployment,
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
} from '@safe-global/safe-deployments';
import { polygon } from 'wagmi/chains';
import { NetworkConfig } from '../../../types/network';

const CHAIN_ID = 137;
const SAFE_VERSION = '1.3.0';

export const polygonConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-polygon.safe.global',
  etherscanBaseURL: 'https://polygonscan.com/',
  etherscanAPIBaseUrl: 'https://api.polygonscan.com/api', // TODO test ABISelector on template builder
  chainId: CHAIN_ID,
  name: polygon.name,
  color: '#753cd8cc',
  nativeTokenSymbol: polygon.nativeCurrency.symbol,
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  wagmiChain: polygon,
  subgraphChainName: 'polygon',
  contracts: {
    fractalAzoriusMasterCopy: Azorius.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesERC20MasterCopy: VotesERC20.address,
    linearVotingERC721MasterCopy: '',
    claimingMasterCopy: ERC20Claim.address,
    azoriusFreezeGuardMasterCopy: AzoriusFreezeGuard.address,
    multisigFreezeVotingMasterCopy: MultisigFreezeVoting.address,
    erc20FreezeVotingMasterCopy: ERC20FreezeVoting.address,
    erc721FreezeVotingMasterCopy: '',
    multisigFreezeGuardMasterCopy: MultisigFreezeGuard.address,
    safe: getSafeSingletonDeployment({ version: SAFE_VERSION, network: CHAIN_ID.toString() })
      ?.defaultAddress!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.defaultAddress!,
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.defaultAddress!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
  },
};
