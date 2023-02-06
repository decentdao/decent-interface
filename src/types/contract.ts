import {
  GnosisSafeProxyFactory,
  GnosisSafe,
  ModuleProxyFactory,
  FractalUsul,
  OZLinearVoting,
  FractalModule,
  FractalRegistry,
  VetoGuard,
  UsulVetoGuard,
  VetoMultisigVoting,
  VetoERC20Voting,
  VotesToken,
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
  fractalUsulMasterCopyContract: ContractConnection<FractalUsul>;
  linearVotingMasterCopyContract: ContractConnection<OZLinearVoting>;
  gnosisSafeSingletonContract: ContractConnection<GnosisSafe>;
  zodiacModuleProxyFactoryContract: ContractConnection<ModuleProxyFactory>;
  fractalModuleMasterCopyContract: ContractConnection<FractalModule>;
  fractalRegistryContract: ContractConnection<FractalRegistry>;
  gnosisVetoGuardMasterCopyContract: ContractConnection<VetoGuard>;
  usulVetoGuardMasterCopyContract: ContractConnection<UsulVetoGuard>;
  vetoMultisigVotingMasterCopyContract: ContractConnection<VetoMultisigVoting>;
  vetoERC20VotingMasterCopyContract: ContractConnection<VetoERC20Voting>;
  votesTokenMasterCopyContract: ContractConnection<VotesToken>;
}
