import { Address, Chain } from 'viem';
import { GovernanceType } from './fractal';

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
  moralis: {
    deFiSupported: boolean;
  };
  contracts: {
    gnosisSafeL2Singleton: Address;
    gnosisSafeProxyFactory: Address;
    compatibilityFallbackHandler: Address;

    multiSendCallOnly: Address;

    zodiacModuleProxyFactory: Address;
    zodiacModuleProxyFactoryOld: Address;

    linearVotingErc20MasterCopy: Address;
    linearVotingErc721MasterCopy: Address;

    moduleAzoriusMasterCopy: Address;
    moduleFractalMasterCopy: Address;

    freezeGuardAzoriusMasterCopy: Address;
    freezeGuardMultisigMasterCopy: Address;

    freezeVotingErc20MasterCopy: Address;
    freezeVotingErc721MasterCopy: Address;
    freezeVotingMultisigMasterCopy: Address;

    votesErc20MasterCopy: Address;
    votesErc20WrapperMasterCopy: Address;

    claimErc20MasterCopy: Address;

    fractalRegistry: Address;
    keyValuePairs: Address;

    decentHatsMasterCopy: Address;
    decentSablierMasterCopy: Address;

    hatsProtocol: Address;
    erc6551Registry: Address;
    hatsAccount1ofNMasterCopy: Address;
    sablierV2Batch: Address;
    sablierV2LockupDynamic: Address;
    sablierV2LockupTranched: Address;
    sablierV2LockupLinear: Address;
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
