/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface IGnosisSafeInterface extends utils.Interface {
  functions: {
    "checkSignatures(bytes32,bytes,bytes)": FunctionFragment;
    "encodeTransactionData(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,uint256)": FunctionFragment;
    "execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)": FunctionFragment;
    "isOwner(address)": FunctionFragment;
    "nonce()": FunctionFragment;
    "setGuard(address)": FunctionFragment;
    "setup(address[],uint256,address,bytes,address,address,uint256,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "checkSignatures"
      | "encodeTransactionData"
      | "execTransaction"
      | "isOwner"
      | "nonce"
      | "setGuard"
      | "setup"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "checkSignatures",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "encodeTransactionData",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "execTransaction",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "isOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "nonce", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setGuard",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setup",
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "checkSignatures",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "encodeTransactionData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "execTransaction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isOwner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nonce", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setGuard", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setup", data: BytesLike): Result;

  events: {};
}

export interface IGnosisSafe extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IGnosisSafeInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    checkSignatures(
      dataHash: PromiseOrValue<BytesLike>,
      data: PromiseOrValue<BytesLike>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[void]>;

    encodeTransactionData(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      _nonce: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    execTransaction(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isOwner(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    nonce(overrides?: CallOverrides): Promise<[BigNumber]>;

    setGuard(
      guard: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setup(
      _owners: PromiseOrValue<string>[],
      _threshold: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      fallbackHandler: PromiseOrValue<string>,
      paymentToken: PromiseOrValue<string>,
      payment: PromiseOrValue<BigNumberish>,
      paymentReceiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  checkSignatures(
    dataHash: PromiseOrValue<BytesLike>,
    data: PromiseOrValue<BytesLike>,
    signatures: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<void>;

  encodeTransactionData(
    to: PromiseOrValue<string>,
    value: PromiseOrValue<BigNumberish>,
    data: PromiseOrValue<BytesLike>,
    operation: PromiseOrValue<BigNumberish>,
    safeTxGas: PromiseOrValue<BigNumberish>,
    baseGas: PromiseOrValue<BigNumberish>,
    gasPrice: PromiseOrValue<BigNumberish>,
    gasToken: PromiseOrValue<string>,
    refundReceiver: PromiseOrValue<string>,
    _nonce: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  execTransaction(
    to: PromiseOrValue<string>,
    value: PromiseOrValue<BigNumberish>,
    data: PromiseOrValue<BytesLike>,
    operation: PromiseOrValue<BigNumberish>,
    safeTxGas: PromiseOrValue<BigNumberish>,
    baseGas: PromiseOrValue<BigNumberish>,
    gasPrice: PromiseOrValue<BigNumberish>,
    gasToken: PromiseOrValue<string>,
    refundReceiver: PromiseOrValue<string>,
    signatures: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isOwner(
    owner: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  nonce(overrides?: CallOverrides): Promise<BigNumber>;

  setGuard(
    guard: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setup(
    _owners: PromiseOrValue<string>[],
    _threshold: PromiseOrValue<BigNumberish>,
    to: PromiseOrValue<string>,
    data: PromiseOrValue<BytesLike>,
    fallbackHandler: PromiseOrValue<string>,
    paymentToken: PromiseOrValue<string>,
    payment: PromiseOrValue<BigNumberish>,
    paymentReceiver: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    checkSignatures(
      dataHash: PromiseOrValue<BytesLike>,
      data: PromiseOrValue<BytesLike>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    encodeTransactionData(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      _nonce: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    execTransaction(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isOwner(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    nonce(overrides?: CallOverrides): Promise<BigNumber>;

    setGuard(
      guard: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setup(
      _owners: PromiseOrValue<string>[],
      _threshold: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      fallbackHandler: PromiseOrValue<string>,
      paymentToken: PromiseOrValue<string>,
      payment: PromiseOrValue<BigNumberish>,
      paymentReceiver: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    checkSignatures(
      dataHash: PromiseOrValue<BytesLike>,
      data: PromiseOrValue<BytesLike>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    encodeTransactionData(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      _nonce: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    execTransaction(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isOwner(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    nonce(overrides?: CallOverrides): Promise<BigNumber>;

    setGuard(
      guard: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setup(
      _owners: PromiseOrValue<string>[],
      _threshold: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      fallbackHandler: PromiseOrValue<string>,
      paymentToken: PromiseOrValue<string>,
      payment: PromiseOrValue<BigNumberish>,
      paymentReceiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    checkSignatures(
      dataHash: PromiseOrValue<BytesLike>,
      data: PromiseOrValue<BytesLike>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    encodeTransactionData(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      _nonce: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    execTransaction(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      operation: PromiseOrValue<BigNumberish>,
      safeTxGas: PromiseOrValue<BigNumberish>,
      baseGas: PromiseOrValue<BigNumberish>,
      gasPrice: PromiseOrValue<BigNumberish>,
      gasToken: PromiseOrValue<string>,
      refundReceiver: PromiseOrValue<string>,
      signatures: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isOwner(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    nonce(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setGuard(
      guard: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setup(
      _owners: PromiseOrValue<string>[],
      _threshold: PromiseOrValue<BigNumberish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      fallbackHandler: PromiseOrValue<string>,
      paymentToken: PromiseOrValue<string>,
      payment: PromiseOrValue<BigNumberish>,
      paymentReceiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
