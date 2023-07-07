import {
  GnosisSafeProxyFactory,
  GnosisSafe,
  ModuleProxyFactory,
  Azorius,
  LinearERC20Voting,
  FractalModule,
  FractalRegistry,
  MultisigFreezeGuard,
  AzoriusFreezeGuard,
  MultisigFreezeVoting,
  ERC20FreezeVoting,
  VotesERC20,
  ERC20Claim,
  KeyValuePairs,
  ERC721FreezeVoting,
} from '@fractal-framework/fractal-contracts';
import { MultiSend } from '../assets/typechain-types/usul';

export interface ContractEvent {
  blockTimestamp: number;
}

export type ContractConnection<T> = {
  asSigner: T;
  asProvider: T;
};

export interface DAOContracts {
  multiSendContract: ContractConnection<MultiSend>;
  safeFactoryContract: ContractConnection<GnosisSafeProxyFactory>;
  fractalAzoriusMasterCopyContract: ContractConnection<Azorius>;
  linearVotingMasterCopyContract: ContractConnection<LinearERC20Voting>;
  safeSingletonContract: ContractConnection<GnosisSafe>;
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
  fractalModuleMasterCopyContract: FractalModule;
  fractalRegistryContract: FractalRegistry;
  safeFactoryContract: GnosisSafeProxyFactory;
  safeSingletonContract: GnosisSafe;
  multisigFreezeGuardMasterCopyContract: MultisigFreezeGuard;
  multiSendContract: MultiSend;
  freezeERC20VotingMasterCopyContract: ERC20FreezeVoting;
  freezeERC721VotingMasterCopyContract: ERC721FreezeVoting;
  freezeMultisigVotingMasterCopyContract: MultisigFreezeVoting;
  zodiacModuleProxyFactoryContract: ModuleProxyFactory;
  keyValuePairsContract: KeyValuePairs;
}
