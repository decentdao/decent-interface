import { ethers } from 'ethers';
import { Address, Chain } from 'viem';
import { GovernanceType } from './fractal';

export type Providers =
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider;

export type NetworkConfig = {
  order: number; // any arbitrary integer, used to "order" the networks in the dropdown
  chain: Chain;
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
  contracts: {
    safe: Address;
    safeFactory: Address;
    fallbackHandler: Address;
    zodiacModuleProxyFactory: Address;
    linearVotingMasterCopy: Address;
    multisend: Address;
    fractalAzoriusMasterCopy: Address;
    fractalModuleMasterCopy: Address;
    fractalRegistry: Address;
    votesERC20MasterCopy: Address;
    linearVotingERC721MasterCopy: Address;
    claimingMasterCopy: Address;
    multisigFreezeGuardMasterCopy: Address;
    azoriusFreezeGuardMasterCopy: Address;
    multisigFreezeVotingMasterCopy: Address;
    erc20FreezeVotingMasterCopy: Address;
    erc721FreezeVotingMasterCopy: Address;
    votesERC20WrapperMasterCopy: Address;
    keyValuePairs: Address;
  };
  staking: {
    lido?: {
      stETHContractAddress: Address;
      rewardsAddress: Address;
      withdrawalQueueContractAddress: Address;
    };
  };
  createOptions: GovernanceType[];
};
