import {
  FractalModule,
  MultisigFreezeGuard,
  MultisigFreezeVoting,
  ERC20FreezeVoting,
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

export interface BaseContracts {
  fractalModuleMasterCopyContract: FractalModule;
  multisigFreezeGuardMasterCopyContract: MultisigFreezeGuard;
  multiSendContract: MultiSend;
  freezeERC20VotingMasterCopyContract: ERC20FreezeVoting;
  freezeERC721VotingMasterCopyContract: ERC721FreezeVoting;
  freezeMultisigVotingMasterCopyContract: MultisigFreezeVoting;
}
