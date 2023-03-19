import {
  VetoGuard,
  UsulVetoGuard,
  VetoERC20Voting,
  VetoMultisigVoting,
} from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { ContractConnection } from './contract';
import { VetoGuardType, VetoVotingType } from './daoGovernance';

export interface IGnosisVetoContract {
  vetoGuardContract: ContractConnection<VetoGuard | UsulVetoGuard> | undefined;
  vetoVotingContract: ContractConnection<VetoERC20Voting | VetoMultisigVoting> | undefined;
  vetoGuardType: VetoGuardType;
  vetoVotingType: VetoVotingType;
}

export type FreezeVoteCastedListener = (voter: string, votesCast: BigNumber, _: any) => void;
