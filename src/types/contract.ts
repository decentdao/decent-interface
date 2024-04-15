import AzoriusABI from '@fractal-framework/fractal-contracts/deployments/mainnet/Azorius.json';
import AzoriusFreezeGuardABI from '@fractal-framework/fractal-contracts/deployments/mainnet/AzoriusFreezeGuard.json';
import ERC20ClaimABI from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20Claim.json';
import ERC20FreezeVotingABI from '@fractal-framework/fractal-contracts/deployments/mainnet/ERC20FreezeVoting.json';
import FractalModuleABI from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalModule.json';
import FractalRegistryABI from '@fractal-framework/fractal-contracts/deployments/mainnet/FractalRegistry.json';
import KeyValuePairsABI from '@fractal-framework/fractal-contracts/deployments/mainnet/KeyValuePairs.json';
import LinearERC20VotingABI from '@fractal-framework/fractal-contracts/deployments/mainnet/LinearERC20Voting.json';
import ModuleProxyFactoryABI from '@fractal-framework/fractal-contracts/deployments/mainnet/ModuleProxyFactory.json';
import MultisigFreezeGuardABI from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeGuard.json';
import MultisigFreezeVotingABI from '@fractal-framework/fractal-contracts/deployments/mainnet/MultisigFreezeVoting.json';
import VotesERC20ABI from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20.json';
import VotesERC20WrapperABI from '@fractal-framework/fractal-contracts/deployments/mainnet/VotesERC20Wrapper.json';
import ERC721FreezeVotingABI from '@fractal-framework/fractal-contracts/deployments/sepolia/ERC721FreezeVoting.json';
import LinearERC721VotingABI from '@fractal-framework/fractal-contracts/deployments/sepolia/LinearERC721Voting.json';
import SafeProxyFactoryABI from '@safe-global/safe-deployments/src/assets/v1.3.0/proxy_factory.json';
import { GetContractReturnType, PublicClient, WalletClient } from 'viem';
import MultiSendABI from '../assets/abi/MultiSend';
import SafeL2ABI from '../assets/abi/SafeL2';
import { NetworkContract } from './network';

export interface ContractEvent {
  blockTimestamp: number;
}

export type ContractConnection<T> = {
  asWallet: T;
  asPublic: T;
};

export type MultiSend = GetContractReturnType<typeof MultiSendABI, WalletClient>;
export type SafeL2 = GetContractReturnType<typeof SafeL2ABI, WalletClient | PublicClient>;
export type SafeProxyFactory = GetContractReturnType<
  typeof SafeProxyFactoryABI.abi,
  WalletClient | PublicClient
>;
export type Azorius = GetContractReturnType<typeof AzoriusABI.abi, WalletClient | PublicClient>;
export type ModuleProxyFactory = GetContractReturnType<
  typeof ModuleProxyFactoryABI.abi,
  PublicClient
>;
export type LinearERC20Voting = GetContractReturnType<
  typeof LinearERC20VotingABI.abi,
  WalletClient | PublicClient
>;
export type FractalModule = GetContractReturnType<
  typeof FractalModuleABI.abi,
  WalletClient | PublicClient
>;
export type FractalRegistry = GetContractReturnType<
  typeof FractalRegistryABI.abi,
  WalletClient | PublicClient
>;
export type MultisigFreezeGuard = GetContractReturnType<
  typeof MultisigFreezeGuardABI.abi,
  WalletClient | PublicClient
>;
export type AzoriusFreezeGuard = GetContractReturnType<
  typeof AzoriusFreezeGuardABI.abi,
  WalletClient | PublicClient
>;
export type MultisigFreezeVoting = GetContractReturnType<
  typeof MultisigFreezeVotingABI.abi,
  WalletClient | PublicClient
>;
export type ERC20FreezeVoting = GetContractReturnType<
  typeof ERC20FreezeVotingABI.abi,
  WalletClient | PublicClient
>;
export type VotesERC20 = GetContractReturnType<
  typeof VotesERC20ABI.abi,
  WalletClient | PublicClient
>;
export type ERC20Claim = GetContractReturnType<
  typeof ERC20ClaimABI.abi,
  WalletClient | PublicClient
>;
export type KeyValuePairs = GetContractReturnType<
  typeof KeyValuePairsABI.abi,
  WalletClient | PublicClient
>;
export type ERC721FreezeVoting = GetContractReturnType<
  typeof ERC721FreezeVotingABI.abi,
  WalletClient | PublicClient
>;
export type VotesERC20Wrapper = GetContractReturnType<
  typeof VotesERC20WrapperABI.abi,
  WalletClient | PublicClient
>;
export type LinearERC721Voting = GetContractReturnType<
  typeof LinearERC721VotingABI.abi,
  WalletClient | PublicClient
>;
export interface DAOContracts {
  multiSendContract: ContractConnection<MultiSend>;
  safeFactoryContract: ContractConnection<SafeProxyFactory>;
  fractalAzoriusMasterCopyContract: ContractConnection<Azorius>;
  linearVotingMasterCopyContract: ContractConnection<LinearERC20Voting>;
  safeSingletonContract: ContractConnection<SafeL2>;
  zodiacModuleProxyFactoryContract: ContractConnection<ModuleProxyFactory>;
  fractalModuleMasterCopyContract: ContractConnection<FractalModule>;
  fractalRegistryContract: ContractConnection<FractalRegistry>;
  multisigFreezeGuardMasterCopyContract: ContractConnection<MultisigFreezeGuard>;
  azoriusFreezeGuardMasterCopyContract: ContractConnection<AzoriusFreezeGuard>;
  freezeMultisigVotingMasterCopyContract: ContractConnection<MultisigFreezeVoting>;
  freezeERC20VotingMasterCopyContract: ContractConnection<ERC20FreezeVoting>;
  votesTokenMasterCopyContract: ContractConnection<VotesERC20>;
  claimingMasterCopyContract: ContractConnection<ERC20Claim>;
  keyValuePairsContract: ContractConnection<KeyValuePairs>;
}

export interface BaseContracts {
  fractalModuleMasterCopyContract: NetworkContract;
  fractalRegistryContract: NetworkContract;
  safeFactoryContract: NetworkContract;
  safeSingletonContract: NetworkContract;
  multisigFreezeGuardMasterCopyContract: NetworkContract;
  multiSendContract: NetworkContract;
  freezeERC20VotingMasterCopyContract: NetworkContract;
  freezeERC721VotingMasterCopyContract?: NetworkContract;
  freezeMultisigVotingMasterCopyContract: NetworkContract;
  zodiacModuleProxyFactoryContract: NetworkContract;
  keyValuePairsContract: NetworkContract;
}
