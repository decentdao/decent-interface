import { BigNumberInput } from './../components/DaoCreator/provider/types/index';

export type TokenAllocation = {
  address: string;
  amount: BigNumberInput;
  addressError?: string;
};
