import { BigNumberInput } from './../components/DaoCreator/provider/types/index';

export type TokenAllocation = {
  address: string;
  isValidAddress: boolean;
  amount: BigNumberInput;
  addressError?: string;
};
