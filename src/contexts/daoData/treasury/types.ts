import { BigNumber } from "ethers";

export interface TokenEvent {
  amount: BigNumber;
  transactionHash: string;
  blockNumber: number;
}

export interface TokenDepositEvent extends TokenEvent {
  address: string
}

export interface TokenWithdrawEvent extends TokenEvent {
  addresses: string[];
  amount: BigNumber;
}
export interface ERC20TokenEvent extends TokenEvent {
  contractAddress: string;
  sender: string;
  amount: BigNumber;
}

export interface TreasuryAsset {
  name: string;
  symbol: string;
  decimals: string;
  contractAddress: string;
  totalAmount: BigNumber;
  formatedTotal: string;
}