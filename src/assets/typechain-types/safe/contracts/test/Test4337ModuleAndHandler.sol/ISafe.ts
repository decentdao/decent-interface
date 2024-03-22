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
} from "../../../common";

export interface ISafeInterface extends utils.Interface {
  functions: {
    "enableModule(address)": FunctionFragment;
    "execTransactionFromModule(address,uint256,bytes,uint8)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "enableModule" | "execTransactionFromModule"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "enableModule",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "execTransactionFromModule",
    values: [string, BigNumberish, BytesLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "enableModule",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "execTransactionFromModule",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ISafe extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ISafeInterface;

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
    enableModule(
      module: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    execTransactionFromModule(
      to: string,
      value: BigNumberish,
      data: BytesLike,
      operation: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  enableModule(
    module: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  execTransactionFromModule(
    to: string,
    value: BigNumberish,
    data: BytesLike,
    operation: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    enableModule(module: string, overrides?: CallOverrides): Promise<void>;

    execTransactionFromModule(
      to: string,
      value: BigNumberish,
      data: BytesLike,
      operation: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    enableModule(
      module: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    execTransactionFromModule(
      to: string,
      value: BigNumberish,
      data: BytesLike,
      operation: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    enableModule(
      module: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    execTransactionFromModule(
      to: string,
      value: BigNumberish,
      data: BytesLike,
      operation: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
