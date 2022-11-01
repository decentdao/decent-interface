import { EthAddress } from '.';
import { BigNumberInput } from './../components/DaoCreator/provider/types/index';

export type TokenAllocation = {
  isValidAddress: boolean;
  amount: BigNumberInput;
  addressError?: string;
} & EthAddress;
