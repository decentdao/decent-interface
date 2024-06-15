import { MultisigFreezeVoting } from '@fractal-framework/fractal-contracts';

export interface ContractEvent {
  blockTimestamp: number;
}

export type ContractConnection<T> = {
  asSigner: T;
  asProvider: T;
};

export interface BaseContracts {
  freezeMultisigVotingMasterCopyContract: MultisigFreezeVoting;
}
