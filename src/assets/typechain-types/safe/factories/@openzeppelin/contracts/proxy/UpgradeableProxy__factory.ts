/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  PayableOverrides,
  BytesLike,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UpgradeableProxy,
  UpgradeableProxyInterface,
} from "../../../../@openzeppelin/contracts/proxy/UpgradeableProxy";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_logic",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60806040526040516108383803806108388339818101604052604081101561002657600080fd5b81019080805190602001909291908051604051939291908464010000000082111561005057600080fd5b8382019150602082018581111561006657600080fd5b825186600182028301116401000000008211171561008357600080fd5b8083526020830192505050908051906020019080838360005b838110156100b757808201518184015260208101905061009c565b50505050905090810190601f1680156100e45780820380516001836020036101000a031916815260200191505b5060405250505060017f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd60001c0360001b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b1461014057fe5b61014f8261017660201b60201c565b60008151111561016f5761016d828261020d60201b6100371760201c565b505b5050610459565b6101898161024060201b6100641760201c565b6101de576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260368152602001806107dc6036913960400191505060405180910390fd5b60007f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b90508181555050565b606061023883836040518060600160405280602781526020016107b56027913961025360201b60201c565b905092915050565b600080823b905060008111915050919050565b60606102648461024060201b60201c565b6102b9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260268152602001806108126026913960400191505060405180910390fd5b6000808573ffffffffffffffffffffffffffffffffffffffff16856040518082805190602001908083835b6020831061030757805182526020820191506020810190506020830392506102e4565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d8060008114610367576040519150601f19603f3d011682016040523d82523d6000602084013e61036c565b606091505b509150915061038282828661038d60201b60201c565b925050509392505050565b6060831561039d57829050610452565b6000835111156103b05782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b838110156104175780820151818401526020810190506103fc565b50505050905090810190601f1680156104445780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b9392505050565b61034d806104686000396000f3fe6080604052366100135761001161001d565b005b61001b61001d565b005b610025610077565b610035610030610079565b6100aa565b565b606061005c83836040518060600160405280602781526020016102cb602791396100d0565b905092915050565b600080823b905060008111915050919050565b565b6000807f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b9050805491505090565b3660008037600080366000845af43d6000803e80600081146100cb573d6000f35b3d6000fd5b60606100db84610064565b610130576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260268152602001806102f26026913960400191505060405180910390fd5b6000808573ffffffffffffffffffffffffffffffffffffffff16856040518082805190602001908083835b6020831061017e578051825260208201915060208101905060208303925061015b565b6001836020036101000a038019825116818451168082178552505050505050905001915050600060405180830381855af49150503d80600081146101de576040519150601f19603f3d011682016040523d82523d6000602084013e6101e3565b606091505b50915091506101f38282866101fe565b925050509392505050565b6060831561020e578290506102c3565b6000835111156102215782518084602001fd5b816040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561028857808201518184015260208101905061026d565b50505050905090810190601f1680156102b55780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b939250505056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6e7472616374a264697066735822122036ffeec5964f760f8d23a72b97982be5f5ba929f68a45a43985de297419ecfc064736f6c63430007060033416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c65645570677261646561626c6550726f78793a206e657720696d706c656d656e746174696f6e206973206e6f74206120636f6e7472616374416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6e7472616374";

type UpgradeableProxyConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UpgradeableProxyConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UpgradeableProxy__factory extends ContractFactory {
  constructor(...args: UpgradeableProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _logic: string,
    _data: BytesLike,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<UpgradeableProxy> {
    return super.deploy(
      _logic,
      _data,
      overrides || {}
    ) as Promise<UpgradeableProxy>;
  }
  override getDeployTransaction(
    _logic: string,
    _data: BytesLike,
    overrides?: PayableOverrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(_logic, _data, overrides || {});
  }
  override attach(address: string): UpgradeableProxy {
    return super.attach(address) as UpgradeableProxy;
  }
  override connect(signer: Signer): UpgradeableProxy__factory {
    return super.connect(signer) as UpgradeableProxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UpgradeableProxyInterface {
    return new utils.Interface(_abi) as UpgradeableProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UpgradeableProxy {
    return new Contract(address, _abi, signerOrProvider) as UpgradeableProxy;
  }
}
