import { Address, Chain } from 'viem';
import { GovernanceType } from './fractal';

export type NetworkContract = {
  address: Address;
  abi: any;
};
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
    safe: NetworkContract;
    safeFactory: NetworkContract;
    fallbackHandler: NetworkContract;
    zodiacModuleProxyFactory: NetworkContract;
    linearVotingMasterCopy: NetworkContract;
    multisend: NetworkContract;
    fractalAzoriusMasterCopy: NetworkContract;
    fractalModuleMasterCopy: NetworkContract;
    fractalRegistry: NetworkContract;
    votesERC20MasterCopy: NetworkContract;
    linearVotingERC721MasterCopy?: NetworkContract;
    claimingMasterCopy: NetworkContract;
    multisigFreezeGuardMasterCopy: NetworkContract;
    azoriusFreezeGuardMasterCopy: NetworkContract;
    multisigFreezeVotingMasterCopy: NetworkContract;
    erc20FreezeVotingMasterCopy: NetworkContract;
    erc721FreezeVotingMasterCopy?: NetworkContract;
    votesERC20WrapperMasterCopy: NetworkContract;
    keyValuePairs: NetworkContract;
  };
  staking: {
    lido?: {
      stETHContractAddress: NetworkContract;
      rewardsAddress: NetworkContract;
      withdrawalQueueContractAddress: NetworkContract;
    };
  };
  createOptions: GovernanceType[];
};
