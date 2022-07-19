import { BigNumberish } from 'ethers';

export type ERC721Funding = {
  address: string;
  tokenID: BigNumberish;
  addressError?: string;
};
