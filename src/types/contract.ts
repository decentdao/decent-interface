import {
  GnosisSafeProxyFactory,
  ModuleProxyFactory,
  FractalModule,
  MultisigFreezeGuard,
  MultisigFreezeVoting,
  ERC20FreezeVoting,
  ERC721FreezeVoting,
} from '@fractal-framework/fractal-contracts';
import { MultiSend } from '../assets/typechain-types/usul';
import { GnosisSafeL2 } from '../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';

export interface ContractEvent {
  blockTimestamp: number;
}

export type ContractConnection<T> = {
  asSigner: T;
  asProvider: T;
};

export interface BaseContracts {
  fractalModuleMasterCopyContract: FractalModule;
  safeFactoryContract: GnosisSafeProxyFactory;
  safeSingletonContract: GnosisSafeL2;
  multisigFreezeGuardMasterCopyContract: MultisigFreezeGuard;
  multiSendContract: MultiSend;
  freezeERC20VotingMasterCopyContract: ERC20FreezeVoting;
  freezeERC721VotingMasterCopyContract: ERC721FreezeVoting;
  freezeMultisigVotingMasterCopyContract: MultisigFreezeVoting;
  zodiacModuleProxyFactoryContract: ModuleProxyFactory;
}
