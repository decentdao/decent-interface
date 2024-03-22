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
} from "../../common";

export interface ERC1155TokenInterface extends utils.Interface {
  functions: {
    "balanceOf(address,uint256)": FunctionFragment;
    "mint(address,uint256,uint256,bytes)": FunctionFragment;
    "safeTransferFrom(address,address,uint256,uint256,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "balanceOf" | "mint" | "safeTransferFrom"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom",
    values: [string, string, BigNumberish, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ERC1155Token extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ERC1155TokenInterface;

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
    balanceOf(
      owner: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    mint(
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  balanceOf(
    owner: string,
    id: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  mint(
    to: string,
    id: BigNumberish,
    value: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  safeTransferFrom(
    from: string,
    to: string,
    id: BigNumberish,
    value: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceOf(
      owner: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mint(
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    balanceOf(
      owner: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mint(
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(
      owner: string,
      id: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    mint(
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    safeTransferFrom(
      from: string,
      to: string,
      id: BigNumberish,
      value: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
