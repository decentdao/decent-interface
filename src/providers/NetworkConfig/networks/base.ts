import { addresses } from '@fractal-framework/fractal-contracts';

import {
  getCompatibilityFallbackHandlerDeployment,
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
} from '@safe-global/safe-deployments';
import { getAddress, zeroAddress } from 'viem';
import { base } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';
import { getSafeContractDeploymentAddress } from './utils';

const SAFE_VERSION = '1.3.0';

const chain = base;
const a = addresses[chain.id];

export const baseConfig: NetworkConfig = {
  order: 10,
  chain,
  rpcEndpoint: `https://base-mainnet.g.alchemy.com/v2/${import.meta.env?.VITE_APP_ALCHEMY_API_KEY}`,
  moralisSupported: true,
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
    gnosisSafeL2Singleton: getSafeContractDeploymentAddress(
      getSafeL2SingletonDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    gnosisSafeProxyFactory: getSafeContractDeploymentAddress(
      getProxyFactoryDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    compatibilityFallbackHandler: getSafeContractDeploymentAddress(
      getCompatibilityFallbackHandlerDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    multiSendCallOnly: getSafeContractDeploymentAddress(
      getMultiSendCallOnlyDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),

    zodiacModuleProxyFactory: '0x000000000000aDdB49795b0f9bA5BC298cDda236',
    zodiacModuleProxyFactoryOld: getAddress(a.ModuleProxyFactory),

    linearVotingErc20MasterCopy: getAddress(a.LinearERC20Voting),
    linearVotingErc721MasterCopy: getAddress(a.LinearERC721Voting),

    moduleAzoriusMasterCopy: getAddress(a.Azorius),
    moduleFractalMasterCopy: getAddress(a.FractalModule),

    freezeGuardAzoriusMasterCopy: getAddress(a.AzoriusFreezeGuard),
    freezeGuardMultisigMasterCopy: getAddress(a.MultisigFreezeGuard),

    freezeVotingErc20MasterCopy: getAddress(a.ERC20FreezeVoting),
    freezeVotingErc721MasterCopy: getAddress(a.ERC721FreezeVoting),
    freezeVotingMultisigMasterCopy: getAddress(a.MultisigFreezeVoting),

    votesErc20MasterCopy: getAddress(a.VotesERC20),
    votesErc20WrapperMasterCopy: getAddress(a.VotesERC20Wrapper),
    claimErc20MasterCopy: getAddress(a.ERC20Claim),

    fractalRegistry: getAddress(a.FractalRegistry),
    keyValuePairs: getAddress(a.KeyValuePairs),
    // @todo update addresses when contracts are deployed
    decentAutonomousAdminMasterCopy: zeroAddress,
    decentHatsMasterCopy: getAddress(a.DecentHats_0_1_0),
    decentSablierMasterCopy: getAddress(a.DecentSablierStreamManagement),

    hatsProtocol: '0x3bc1A0Ad72417f2d411118085256fC53CBdDd137',
    erc6551Registry: '0x000000006551c19487814612e58FE06813775758',
    hatsAccount1ofNMasterCopy: '0xfEf83A660b7C10a3EdaFdCF62DEee1fD8a875D29',
    sablierV2Batch: '0xc1c548F980669615772dadcBfEBC29937c29481A',
    sablierV2LockupDynamic: '0xF9E9eD67DD2Fab3b3ca024A2d66Fcf0764d36742',
    sablierV2LockupTranched: '0xf4937657Ed8B3f3cB379Eed47b8818eE947BEb1e',
    sablierV2LockupLinear: '0x4CB16D4153123A74Bc724d161050959754f378D8',
  },
  staking: {},
  moralis: {
    deFiSupported: true,
  },
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};

export default baseConfig;
