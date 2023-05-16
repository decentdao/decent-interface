import {
  MultisigFreezeGuard,
  AzoriusFreezeGuard,
  ERC20FreezeVoting,
  MultisigFreezeVoting,
} from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { ContractConnection } from './contract';
import { FreezeGuardType, FreezeVotingType } from './daoGovernance';

export interface IMultisigFreezeContract {
  freezeGuardContract: ContractConnection<MultisigFreezeGuard | AzoriusFreezeGuard> | undefined;
  freezeVotingContract: ContractConnection<ERC20FreezeVoting | MultisigFreezeVoting> | undefined;
  freezeGuardType: FreezeGuardType;
  freezeVotingType: FreezeVotingType;
}

export type FreezeVoteCastedListener = (voter: string, votesCast: BigNumber, _: any) => void;
