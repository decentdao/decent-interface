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
  gnosisSafeFactoryContract: ContractConnection<GnosisSafeProxyFactory>;
  fractalAzoriusMasterCopyContract: ContractConnection<Azorius>;
  linearVotingMasterCopyContract: ContractConnection<LinearERC20Voting>;
  gnosisSafeSingletonContract: ContractConnection<GnosisSafe>;
  zodiacModuleProxyFactoryContract: ContractConnection<ModuleProxyFactory>;
  fractalModuleMasterCopyContract: ContractConnection<FractalModule>;
  fractalRegistryContract: ContractConnection<FractalRegistry>;
  gnosisVetoGuardMasterCopyContract: ContractConnection<MultisigFreezeGuard>;
  azoriusVetoGuardMasterCopyContract: ContractConnection<AzoriusFreezeGuard>;
  vetoMultisigVotingMasterCopyContract: ContractConnection<MultisigFreezeVoting>;
  vetoERC20VotingMasterCopyContract: ContractConnection<ERC20FreezeVoting>;
  votesTokenMasterCopyContract: ContractConnection<VotesERC20>;
  claimingMasterCopyContract: ContractConnection<ERC20Claim>;
}

export interface BaseContracts {
  fractalModuleMasterCopyContract: FractalModule;
  fractalRegistryContract: FractalRegistry;
  gnosisSafeFactoryContract: GnosisSafeProxyFactory;
  gnosisSafeSingletonContract: GnosisSafe;
  gnosisVetoGuardMasterCopyContract: MultisigFreezeGuard;
  multiSendContract: MultiSend;
  vetoERC20VotingMasterCopyContract: ERC20FreezeVoting;
  vetoMultisigVotingMasterCopyContract: MultisigFreezeVoting;
  zodiacModuleProxyFactoryContract: ModuleProxyFactory;
}
