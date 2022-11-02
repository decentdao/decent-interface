import { ethers } from 'ethers';
import {
  IERC20Metadata,
  IERC20Metadata__factory,
} from '../../../assets/typechain-types/votes-token';
export class Web3Token {
  public contract: IERC20Metadata;

  private _name?: string;

  private _symbol?: string;

  private _decimals?: number;

  constructor(public readonly tokenAddress: string, provider: ethers.providers.BaseProvider) {
    this.contract = IERC20Metadata__factory.connect(this.tokenAddress, provider);
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

  public async decimals(): Promise<number> {
    if (this._decimals) {
      return this._decimals;
    }
    const decimals = await this.contract.decimals();
    this._decimals = decimals;
    return decimals;
  }
}
