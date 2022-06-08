import { BigNumber } from 'ethers';

export interface ProposalData {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
  description: string;
}
