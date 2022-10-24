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
  PromiseOrValue,
} from "../../common";

export interface ICallbackGnosisInterface extends utils.Interface {
  functions: {
    "multiTx(address[],bytes[],address)": FunctionFragment;
    "proxyCreated(address,address,bytes,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "multiTx" | "proxyCreated"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "multiTx",
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "proxyCreated",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "multiTx", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proxyCreated",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ICallbackGnosis extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICallbackGnosisInterface;

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
    multiTx(
      _targets: PromiseOrValue<string>[],
      _txs: PromiseOrValue<BytesLike>[],
      _proxy: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    proxyCreated(
      proxy: PromiseOrValue<string>,
      _singleton: PromiseOrValue<string>,
      initializer: PromiseOrValue<BytesLike>,
      saltNonce: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  multiTx(
    _targets: PromiseOrValue<string>[],
    _txs: PromiseOrValue<BytesLike>[],
    _proxy: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  proxyCreated(
    proxy: PromiseOrValue<string>,
    _singleton: PromiseOrValue<string>,
    initializer: PromiseOrValue<BytesLike>,
    saltNonce: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    multiTx(
      _targets: PromiseOrValue<string>[],
      _txs: PromiseOrValue<BytesLike>[],
      _proxy: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    proxyCreated(
      proxy: PromiseOrValue<string>,
      _singleton: PromiseOrValue<string>,
      initializer: PromiseOrValue<BytesLike>,
      saltNonce: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    multiTx(
      _targets: PromiseOrValue<string>[],
      _txs: PromiseOrValue<BytesLike>[],
      _proxy: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    proxyCreated(
      proxy: PromiseOrValue<string>,
      _singleton: PromiseOrValue<string>,
      initializer: PromiseOrValue<BytesLike>,
      saltNonce: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    multiTx(
      _targets: PromiseOrValue<string>[],
      _txs: PromiseOrValue<BytesLike>[],
      _proxy: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    proxyCreated(
      proxy: PromiseOrValue<string>,
      _singleton: PromiseOrValue<string>,
      initializer: PromiseOrValue<BytesLike>,
      saltNonce: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
