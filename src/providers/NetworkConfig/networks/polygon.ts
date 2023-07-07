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
    fractalAzoriusMasterCopy: '',
    fractalModuleMasterCopy: '',
    fractalRegistry: '',
    votesERC20MasterCopy: '',
    votingERC721MasterCopy: '',
    claimingMasterCopy: '',
    azoriusFreezeGuardMasterCopy: '',
    multisigFreezeVotingMasterCopy: '',
    erc20FreezeVotingMasterCopy: '',
    erc721FreezeVotingMasterCopy: '',
    multisigFreezeGuardMasterCopy: '',
    safe: getSafeSingletonDeployment({ version: SAFE_VERSION, network: CHAIN_ID.toString() })
      ?.defaultAddress!,
    safeFactory: getProxyFactoryDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.defaultAddress!,
    zodiacModuleProxyFactory: '',
    linearVotingMasterCopy: '',
    multisend: getMultiSendCallOnlyDeployment({
      version: SAFE_VERSION,
      network: CHAIN_ID.toString(),
    })?.defaultAddress!,
    votesERC20WrapperMasterCopy: '',
    keyValuePairs: '',
  },
};
