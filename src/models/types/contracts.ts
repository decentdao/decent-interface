import {
  FractalModule,
  FractalRegistry,
  FractalUsul,
  GnosisSafe,
  GnosisSafeProxyFactory,
  ModuleProxyFactory,
  OZLinearVoting,
  UsulVetoGuard,
  VetoERC20Voting,
  VetoGuard,
  VetoMultisigVoting,
  VotesToken,
} from '@fractal-framework/fractal-contracts';
import { MultiSend } from '../../assets/typechain-types/usul';

export interface BaseContracts {
  fractalModuleMasterCopyContract: FractalModule;
  fractalRegistryContract: FractalRegistry;
  gnosisSafeFactoryContract: GnosisSafeProxyFactory;
  gnosisSafeSingletonContract: GnosisSafe;
  gnosisVetoGuardMasterCopyContract: VetoGuard;
  multiSendContract: MultiSend;
  vetoERC20VotingMasterCopyContract: VetoERC20Voting;
  vetoMultisigVotingMasterCopyContract: VetoMultisigVoting;
  zodiacModuleProxyFactoryContract: ModuleProxyFactory;
}

export interface UsulContracts {
  fractalUsulMasterCopyContract: FractalUsul;
  linearVotingMasterCopyContract: OZLinearVoting;
  usulVetoGuardMasterCopyContract: UsulVetoGuard;
  votesTokenMasterCopyContract: VotesToken;
}
