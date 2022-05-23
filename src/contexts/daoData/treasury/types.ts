import { BigNumber } from "ethers";

export interface TokenEvent {
  address: string;
  amount: BigNumber;
  transactionHash: string;
  blockNumber: number;
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
}