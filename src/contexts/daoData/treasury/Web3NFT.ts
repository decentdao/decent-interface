import { BigNumber, ethers } from 'ethers';
import {
  IERC721Metadata,
  IERC721Metadata__factory,
} from '../../../assets/typechain-types/module-treasury';
export default class Web3NFT {
  public contract: IERC721Metadata;

  private _name?: string;

  private _symbol?: string;

  private _tokenURI?: string;

  constructor(public readonly tokenAddress: string, provider: ethers.providers.BaseProvider) {
    this.contract = IERC721Metadata__factory.connect(this.tokenAddress, provider);
  }

  public async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }
    const name = await this.contract.name();
    this._name = name;
    return name;
  }

  public async symbol(): Promise<string> {
    if (this._symbol) {
      return this._symbol;
    }
    const symbol = await this.contract.symbol();
    this._symbol = symbol;
    return symbol;
  }

  public async tokenURI(tokenId: BigNumber): Promise<string> {
    if (this._tokenURI) {
      return this._tokenURI;
    }
    const tokenURI = await this.contract.tokenURI(tokenId);
    this._tokenURI = tokenURI;
    return tokenURI;
  }
}
