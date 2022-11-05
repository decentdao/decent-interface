import { BigNumberInput } from './../components/DaoCreator/provider/types/index';
import { EthAddress } from '.';

export type TokenAllocation = {
  isValidAddress: boolean;
  amount: BigNumberInput;
  addressError?: string;
} & EthAddress;
