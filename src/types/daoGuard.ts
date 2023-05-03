import {
  MultisigFreezeGuard,
  AzoriusFreezeGuard,
  ERC20FreezeVoting,
  MultisigFreezeVoting,
} from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { ContractConnection } from './contract';
import { FreezeGuardType, FreezeVotingType } from './daoGovernance';

export interface IGnosisVetoContract {
  vetoGuardContract: ContractConnection<MultisigFreezeGuard | AzoriusFreezeGuard> | undefined;
  vetoVotingContract: ContractConnection<ERC20FreezeVoting | MultisigFreezeVoting> | undefined;
  freezeGuardType: FreezeGuardType;
  vetoVotingType: FreezeVotingType;
}

export type FreezeVoteCastedListener = (voter: string, votesCast: BigNumber, _: any) => void;
