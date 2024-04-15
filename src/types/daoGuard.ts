import {
  AzoriusFreezeGuard,
  ContractConnection,
  ERC20FreezeVoting,
  MultisigFreezeGuard,
  MultisigFreezeVoting,
} from './contract';
import { FreezeGuardType, FreezeVotingType } from './daoGovernance';

export interface IMultisigFreezeContract {
  freezeGuardContract: ContractConnection<MultisigFreezeGuard | AzoriusFreezeGuard> | undefined;
  freezeVotingContract: ContractConnection<ERC20FreezeVoting | MultisigFreezeVoting> | undefined;
  freezeGuardType: FreezeGuardType;
  freezeVotingType: FreezeVotingType;
}

export type FreezeVoteCastedListener = (voter: string, votesCast: bigint, _: any) => void;
