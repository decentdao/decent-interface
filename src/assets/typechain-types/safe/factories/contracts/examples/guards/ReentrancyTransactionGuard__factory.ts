/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ReentrancyTransactionGuard,
  ReentrancyTransactionGuardInterface,
} from "../../../../contracts/examples/guards/ReentrancyTransactionGuard";

const _abi = [
  {
    stateMutability: "nonpayable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    name: "checkAfterExecution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "enum Enum.Operation",
        name: "operation",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "checkModuleTransaction",
    outputs: [
      {
        internalType: "bytes32",
        name: "moduleTxHash",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
      {
        internalType: "enum Enum.Operation",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "checkTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506107c5806100206000396000f3fe608060405234801561001057600080fd5b50600436106100505760003560e01c806301ffc9a714610053578063728c2972146100b657806375f0bb52146101dc57806393271368146103e457610051565b5b005b61009e6004803603602081101561006957600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916906020019092919050505061041e565b60405180821515815260200191505060405180910390f35b6101c6600480360360a08110156100cc57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561011357600080fd5b82018360208201111561012557600080fd5b8035906020019184600183028401116401000000008311171561014757600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290803560ff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506104f0565b6040518082815260200191505060405180910390f35b6103e260048036036101608110156101f357600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561023a57600080fd5b82018360208201111561024c57600080fd5b8035906020019184600183028401116401000000008311171561026e57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290803560ff169060200190929190803590602001909291908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561033c57600080fd5b82018360208201111561034e57600080fd5b8035906020019184600183028401116401000000008311171561037057600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061067e565b005b61041c600480360360408110156103fa57600080fd5b810190808035906020019092919080351515906020019092919050505061073a565b005b60007f945b8148000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806104e957507f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b60008585858585604051602001808673ffffffffffffffffffffffffffffffffffffffff1660601b815260140185815260200184805190602001908083835b60208310610552578051825260208201915060208101905060208303925061052f565b6001836020036101000a03801982511681845116808217855250505050505090500183600181111561058057fe5b60f81b81526001018273ffffffffffffffffffffffffffffffffffffffff1660601b81526014019550505050505060405160208183030381529060405280519060200120905060006105d0610762565b90508060000160009054906101000a900460ff1615610657576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260138152602001807f5265656e7472616e63792064657465637465640000000000000000000000000081525060200191505060405180910390fd5b60018160000160006101000a81548160ff0219169083151502179055505095945050505050565b6000610688610762565b90508060000160009054906101000a900460ff161561070f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260138152602001807f5265656e7472616e63792064657465637465640000000000000000000000000081525060200191505060405180910390fd5b60018160000160006101000a81548160ff021916908315150217905550505050505050505050505050565b6000610744610762565b60000160006101000a81548160ff0219169083151502179055505050565b6000807f7c1d45961c2d0298f999d2c3d4a7a5e0f688d137f4c32466e3056a97e673b83a9050809150509056fea2646970667358221220d75f1c336205e75ff298a824b90a37716fefc8902239b531be7377a77c353e5564736f6c63430007060033";

type ReentrancyTransactionGuardConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReentrancyTransactionGuardConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ReentrancyTransactionGuard__factory extends ContractFactory {
  constructor(...args: ReentrancyTransactionGuardConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<ReentrancyTransactionGuard> {
    return super.deploy(overrides || {}) as Promise<ReentrancyTransactionGuard>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ReentrancyTransactionGuard {
    return super.attach(address) as ReentrancyTransactionGuard;
  }
  override connect(signer: Signer): ReentrancyTransactionGuard__factory {
    return super.connect(signer) as ReentrancyTransactionGuard__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReentrancyTransactionGuardInterface {
    return new utils.Interface(_abi) as ReentrancyTransactionGuardInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ReentrancyTransactionGuard {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ReentrancyTransactionGuard;
  }
}
