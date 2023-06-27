import Azorius from '@fractal-framework/fractal-contracts/deployments/goerli/Azorius.json';
import AzoriusFreezeGuard from '@fractal-framework/fractal-contracts/deployments/goerli/AzoriusFreezeGuard.json';
import ERC20Claim from '@fractal-framework/fractal-contracts/deployments/goerli/ERC20Claim.json';
import ERC20FreezeVoting from '@fractal-framework/fractal-contracts/deployments/goerli/ERC20FreezeVoting.json';
import FractalModule from '@fractal-framework/fractal-contracts/deployments/goerli/FractalModule.json';
import FractalRegistry from '@fractal-framework/fractal-contracts/deployments/goerli/FractalRegistry.json';
import KeyValuePairs from '@fractal-framework/fractal-contracts/deployments/goerli/KeyValuePairs.json';
import LinearERC20Voting from '@fractal-framework/fractal-contracts/deployments/goerli/LinearERC20Voting.json';
import ModuleProxyFactory from '@fractal-framework/fractal-contracts/deployments/goerli/ModuleProxyFactory.json';
import MultisigFreezeGuard from '@fractal-framework/fractal-contracts/deployments/goerli/MultisigFreezeGuard.json';
import MultisigFreezeVoting from '@fractal-framework/fractal-contracts/deployments/goerli/MultisigFreezeVoting.json';
import VotesERC20 from '@fractal-framework/fractal-contracts/deployments/goerli/VotesERC20.json';
import VotesERC20Wrapper from '@fractal-framework/fractal-contracts/deployments/goerli/VotesERC20Wrapper.json';
import {
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeSingletonDeployment,
} from '@safe-global/safe-deployments';
import { goerli } from 'wagmi/chains';
import { NetworkConfig } from '../../../types/network';

const CHAIN_ID = 5;
const SAFE_VERSION = '1.3.0';

export const goerliConfig: NetworkConfig = {
  safeBaseURL: 'https://safe-transaction-goerli.safe.global',
  etherscanBaseURL: 'https://goerli.etherscan.io',
  etherscanAPIBaseUrl: 'https://api-goerli.etherscan.io',
  chainId: CHAIN_ID,
  name: goerli.name,
  color: 'gold.300',
  nativeTokenSymbol: goerli.nativeCurrency.symbol,
  nativeTokenIcon: '/images/coin-icon-eth.svg',
  wagmiChain: goerli,
  subgraphChainName: 'goerli',
  contracts: {
    fractalAzoriusMasterCopy: Azorius.address,
    fractalModuleMasterCopy: FractalModule.address,
    fractalRegistry: FractalRegistry.address,
    votesERC20MasterCopy: VotesERC20.address,
    claimingMasterCopy: ERC20Claim.address,
    azoriusFreezeGuardMasterCopy: AzoriusFreezeGuard.address,
    multisigFreezeVotingMasterCopy: MultisigFreezeVoting.address,
    erc20FreezeVotingMasterCopy: ERC20FreezeVoting.address,
    multisigFreezeGuardMasterCopy: MultisigFreezeGuard.address,
    gnosisSafe: getSafeSingletonDeployment({ version: SAFE_VERSION, network: CHAIN_ID.toString() })
      ?.defaultAddress!,
    gnosisSafeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.defaultAddress!,
    zodiacModuleProxyFactory: ModuleProxyFactory.address,
    linearVotingMasterCopy: LinearERC20Voting.address,
    gnosisMultisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.defaultAddress!,
    votesERC20WrapperMasterCopy: VotesERC20Wrapper.address,
    keyValuePairs: KeyValuePairs.address,
  },
};
