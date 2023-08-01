import Azorius from '@fractal-framework/fractal-contracts/deployments/mainnet/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/mainnet/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20FreezeVoting.json';
import FractalModule from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/mainnet/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/mainnet/LinearERC20Voting.json';
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/mainnet/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20Wrapper.json';
import {
  getSafeSingletonDeployment,
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
} from '@safe-global/safe-deployments';
import { mainnet } from 'wagmi/chains';
import { NetworkConfig } from '../../../types/network';

const CHAIN_ID = 1;
const SAFE_VERSION = '1.3.0';

export const mainnetConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-mainnet.safe.global',
  etherscanBaseURL: 'https://etherscan.io',
  etherscanAPIBaseUrl: 'https://api.etherscan.io',
  chainId: CHAIN_ID,
  name: mainnet.name,
  color: 'blue.400',
  nativeTokenSymbol: mainnet.nativeCurrency.symbol,
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  wagmiChain: mainnet,
  subgraphChainName: 'mainnet',
  contracts: {
    fractalAzoriusMasterCopy: Azorius.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesERC20MasterCopy: VotesERC20.address,
    linearVotingERC721MasterCopy: '', // TODO - Add actual address once contract is deployed on mainnet
    claimingMasterCopy: ERC20Claim.address,
    azoriusFreezeGuardMasterCopy: AzoriusFreezeGuard.address,
    multisigFreezeVotingMasterCopy: MultisigFreezeVoting.address,
    erc20FreezeVotingMasterCopy: ERC20FreezeVoting.address,
    erc721FreezeVotingMasterCopy: '', // TODO - Add actual address once contract is deployed on mainnet
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
  staking: {
    lido: {
      rewardsAddress: '0x2884b7Bf17Ca966bB2e4099bf384734a48885Df0', // TODO - Change to Fractal Safe
      stETHContractAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    },
  },
};
