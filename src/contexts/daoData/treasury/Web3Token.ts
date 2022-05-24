import { Contract, ethers } from "ethers";

const ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];
export default class Web3Token {
  public contract: Contract;
  private _name?: string;
  private _symbol?: string;
  private _decimals?: string;

  constructor(public readonly tokenAddress: string, provider: ethers.providers.BaseProvider) {
    this.contract = new Contract(this.tokenAddress, ABI, provider);
  }

  public async name(): Promise<string> {
    if (this._name) {
      return this._name;
    }
    const name = await this.contract.name.call();
    this._name = name;
    return name;
  }

  public async symbol(): Promise<string> {
    if (this._symbol) {
      return this._symbol;
    }
    const symbol = await this.contract.symbol.call();
    this._symbol = symbol;
    return symbol;
  }

  public async decimals(): Promise<string> {
    if (this._decimals) {
      return this._decimals;
    }
    const decimals = await this.contract.decimals.call();
    this._decimals = decimals;
    return decimals;
  }
}
