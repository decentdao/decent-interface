import { ethers } from 'ethers';
import { Chain } from 'wagmi';

export type Providers =
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider;

export type NetworkConfig = {
  safeBaseURL: string;
  etherscanBaseURL: string;
  etherscanAPIBaseUrl: string;
  chainId: number;
  name: string;
  color: string;
  nativeTokenSymbol: string;
  nativeTokenIcon: string;
  wagmiChain: Chain;
  contracts: {
    gnosisSafe: string;
    gnosisSafeFactory: string;
    zodiacModuleProxyFactory: string;
    linearVotingMasterCopy: string;
    gnosisMultisend: string;
    fractalAzoriusMasterCopy: string;
    fractalModuleMasterCopy: string;
    fractalRegistry: string;
    votesERC20MasterCopy: string;
    claimingMasterCopy: string;
    multisigFreezeGuardMasterCopy: string;
    azoriusFreezeGuardMasterCopy: string;
    multisigFreezeVotingMasterCopy: string;
    erc20FreezeVotingMasterCopy: string;
    votesERC20WrapperMasterCopy: string;
  };
};
