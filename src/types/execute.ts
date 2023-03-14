import { BigNumberish } from 'ethers';

export interface ExecuteData {
  targets: string[];
  values: BigNumberish[];
  calldatas: string[];
}
