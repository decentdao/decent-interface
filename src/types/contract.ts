import { MultisigFreezeVoting, ERC721FreezeVoting } from '@fractal-framework/fractal-contracts';

export interface ContractEvent {
  blockTimestamp: number;
}

export type ContractConnection<T> = {
  asSigner: T;
  asProvider: T;
};

export interface BaseContracts {
  freezeERC721VotingMasterCopyContract: ERC721FreezeVoting;
  freezeMultisigVotingMasterCopyContract: MultisigFreezeVoting;
}
