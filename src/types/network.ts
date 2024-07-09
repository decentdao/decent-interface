import { ethers } from 'ethers';
import { Chain } from 'viem';
import { GovernanceType } from './fractal';

export type Providers =
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider;

export type NetworkConfig = {
  order: number; // any arbitrary integer, used to "order" the networks in the dropdown
  chain: Chain;
  moralisSupported: boolean;
  rpcEndpoint: string;
  safeBaseURL: string;
  etherscanBaseURL: string;
  etherscanAPIUrl: string;
  addressPrefix: string; // copy whatever Safe uses
  nativeTokenIcon: string;
  subgraph: {
    space: number;
    slug: string;
    version: string;
  };
  // @dev - might be not supported on some chains
  sablierSubgraph?: {
    space: number;
    slug: string;
  };
  contracts: {
    safe: string;
    safeFactory: string;
    fallbackHandler: string;
    zodiacModuleProxyFactory: string;
    linearVotingMasterCopy: string;
    multisend: string;
    fractalAzoriusMasterCopy: string;
    fractalModuleMasterCopy: string;
    fractalRegistry: string;
    votesERC20MasterCopy: string;
    linearVotingERC721MasterCopy: string;
    claimingMasterCopy: string;
    multisigFreezeGuardMasterCopy: string;
    azoriusFreezeGuardMasterCopy: string;
    multisigFreezeVotingMasterCopy: string;
    erc20FreezeVotingMasterCopy: string;
    erc721FreezeVotingMasterCopy: string;
    votesERC20WrapperMasterCopy: string;
    keyValuePairs: string;
    decentHatsMasterCopy: string;
    hatsProtocol: string;
  };
  constants: {
    ha75Address: string;
  };
  staking: {
    lido?: {
      stETHContractAddress: string;
      rewardsAddress: string;
      withdrawalQueueContractAddress: string;
    };
  };
  createOptions: GovernanceType[];
};
