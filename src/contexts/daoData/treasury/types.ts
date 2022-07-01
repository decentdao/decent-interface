import { BigNumber } from 'ethers';

export interface TokenEvent {
  transactionHash: string;
  blockNumber: number;
}

export interface TokenDepositEvent extends TokenEvent {
  address: string;
  amount: BigNumber;
}

export interface TokenWithdrawEvent extends TokenEvent {
  addresses: string[];
  amount: BigNumber;
}
export interface ERC721TokenEvent extends TokenEvent {
  contractAddresses: string[];
  tokenIds: BigNumber[];
}
export interface ERC20TokenEvent extends TokenEvent {
  contractAddresses: string[];
  amounts: BigNumber[];
}

export interface TreasuryAsset {
  type: string;
  name: string;
  symbol: string;
  decimals: number;
  tokenId: BigNumber;
  contractAddress: string;
  totalAmount: BigNumber;
  formatedTotal: string;
  tokenURI: string;
}
