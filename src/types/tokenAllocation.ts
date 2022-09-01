import { InputBN } from './../components/DaoCreator/provider/types/index';

export type TokenAllocation = {
  address: string;
  amount: InputBN;
  addressError?: string;
};
