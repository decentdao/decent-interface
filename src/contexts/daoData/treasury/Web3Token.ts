import { Contract, ethers } from "ethers";
import { ERC20_TOKEN_ABI } from "../../../typechain-types/factories/@openzeppelin/contracts/token/ERC20/ERC20__factory";

export default class Web3Token {
  public contract: Contract;
  constructor(public readonly tokenAddress: string, provider: ethers.providers.BaseProvider) {
    this.contract = new Contract(this.tokenAddress, ERC20_TOKEN_ABI, provider);
  }

  public async tokenName(): Promise<string> {
    return await this.contract.name.call();
  }

  public async tokenSymbol(): Promise<string> {
    return await this.contract.symbol.call();
  }

  public async tokenDecimals(): Promise<string> {
    return await this.contract.decimals.call();
  }
}
