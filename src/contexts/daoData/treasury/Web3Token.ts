import { Contract, ethers } from "ethers";

const ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];
export default class Web3Token {
  public contract: Contract;
  constructor(public readonly tokenAddress: string, provider: ethers.providers.BaseProvider) {
    this.contract = new Contract(this.tokenAddress, ABI, provider);
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
