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
} from "../../../../common";

export interface MockInterfaceInterface extends utils.Interface {
  functions: {
    "givenAnyReturn(bytes)": FunctionFragment;
    "givenAnyReturnAddress(address)": FunctionFragment;
    "givenAnyReturnBool(bool)": FunctionFragment;
    "givenAnyReturnUint(uint256)": FunctionFragment;
    "givenAnyRevert()": FunctionFragment;
    "givenAnyRevertWithMessage(string)": FunctionFragment;
    "givenAnyRunOutOfGas()": FunctionFragment;
    "givenCalldataReturn(bytes,bytes)": FunctionFragment;
    "givenCalldataReturnAddress(bytes,address)": FunctionFragment;
    "givenCalldataReturnBool(bytes,bool)": FunctionFragment;
    "givenCalldataReturnBytes32(bytes,bytes32)": FunctionFragment;
    "givenCalldataReturnUint(bytes,uint256)": FunctionFragment;
    "givenCalldataRevert(bytes)": FunctionFragment;
    "givenCalldataRevertWithMessage(bytes,string)": FunctionFragment;
    "givenCalldataRunOutOfGas(bytes)": FunctionFragment;
    "givenMethodReturn(bytes,bytes)": FunctionFragment;
    "givenMethodReturnAddress(bytes,address)": FunctionFragment;
    "givenMethodReturnBool(bytes,bool)": FunctionFragment;
    "givenMethodReturnBytes32(bytes,bytes32)": FunctionFragment;
    "givenMethodReturnUint(bytes,uint256)": FunctionFragment;
    "givenMethodRevert(bytes)": FunctionFragment;
    "givenMethodRevertWithMessage(bytes,string)": FunctionFragment;
    "givenMethodRunOutOfGas(bytes)": FunctionFragment;
    "invocationCount()": FunctionFragment;
    "invocationCountForCalldata(bytes)": FunctionFragment;
    "invocationCountForMethod(bytes)": FunctionFragment;
    "reset()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "givenAnyReturn"
      | "givenAnyReturnAddress"
      | "givenAnyReturnBool"
      | "givenAnyReturnUint"
      | "givenAnyRevert"
      | "givenAnyRevertWithMessage"
      | "givenAnyRunOutOfGas"
      | "givenCalldataReturn"
      | "givenCalldataReturnAddress"
      | "givenCalldataReturnBool"
      | "givenCalldataReturnBytes32"
      | "givenCalldataReturnUint"
      | "givenCalldataRevert"
      | "givenCalldataRevertWithMessage"
      | "givenCalldataRunOutOfGas"
      | "givenMethodReturn"
      | "givenMethodReturnAddress"
      | "givenMethodReturnBool"
      | "givenMethodReturnBytes32"
      | "givenMethodReturnUint"
      | "givenMethodRevert"
      | "givenMethodRevertWithMessage"
      | "givenMethodRunOutOfGas"
      | "invocationCount"
      | "invocationCountForCalldata"
      | "invocationCountForMethod"
      | "reset"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "givenAnyReturn",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenAnyReturnAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "givenAnyReturnBool",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "givenAnyReturnUint",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "givenAnyRevert",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "givenAnyRevertWithMessage",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "givenAnyRunOutOfGas",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataReturn",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataReturnAddress",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataReturnBool",
    values: [BytesLike, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataReturnBytes32",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataReturnUint",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataRevert",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataRevertWithMessage",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "givenCalldataRunOutOfGas",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodReturn",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodReturnAddress",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodReturnBool",
    values: [BytesLike, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodReturnBytes32",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodReturnUint",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodRevert",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodRevertWithMessage",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "givenMethodRunOutOfGas",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "invocationCount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "invocationCountForCalldata",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "invocationCountForMethod",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "reset", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "givenAnyReturn",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenAnyReturnAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenAnyReturnBool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenAnyReturnUint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenAnyRevert",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenAnyRevertWithMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenAnyRunOutOfGas",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataReturn",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataReturnAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataReturnBool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataReturnBytes32",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataReturnUint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataRevert",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataRevertWithMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenCalldataRunOutOfGas",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodReturn",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodReturnAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodReturnBool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodReturnBytes32",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodReturnUint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodRevert",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodRevertWithMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "givenMethodRunOutOfGas",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "invocationCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "invocationCountForCalldata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "invocationCountForMethod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "reset", data: BytesLike): Result;

  events: {};
}

export interface MockInterface extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MockInterfaceInterface;

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
    givenAnyReturn(
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenAnyReturnAddress(
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenAnyReturnBool(
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenAnyReturnUint(
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenAnyRevert(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenAnyRevertWithMessage(
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenAnyRunOutOfGas(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataReturn(
      call: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataReturnAddress(
      call: BytesLike,
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataReturnBool(
      call: BytesLike,
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataReturnBytes32(
      call: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataReturnUint(
      call: BytesLike,
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataRevert(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataRevertWithMessage(
      call: BytesLike,
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenCalldataRunOutOfGas(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodReturn(
      method: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodReturnAddress(
      method: BytesLike,
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodReturnBool(
      method: BytesLike,
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodReturnBytes32(
      method: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodReturnUint(
      method: BytesLike,
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodRevert(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodRevertWithMessage(
      method: BytesLike,
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    givenMethodRunOutOfGas(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    invocationCount(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    invocationCountForCalldata(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    invocationCountForMethod(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    reset(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  givenAnyReturn(
    response: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenAnyReturnAddress(
    response: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenAnyReturnBool(
    response: boolean,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenAnyReturnUint(
    response: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenAnyRevert(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenAnyRevertWithMessage(
    message: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenAnyRunOutOfGas(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataReturn(
    call: BytesLike,
    response: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataReturnAddress(
    call: BytesLike,
    response: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataReturnBool(
    call: BytesLike,
    response: boolean,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataReturnBytes32(
    call: BytesLike,
    response: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataReturnUint(
    call: BytesLike,
    response: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataRevert(
    call: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataRevertWithMessage(
    call: BytesLike,
    message: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenCalldataRunOutOfGas(
    call: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodReturn(
    method: BytesLike,
    response: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodReturnAddress(
    method: BytesLike,
    response: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodReturnBool(
    method: BytesLike,
    response: boolean,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodReturnBytes32(
    method: BytesLike,
    response: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodReturnUint(
    method: BytesLike,
    response: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodRevert(
    method: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodRevertWithMessage(
    method: BytesLike,
    message: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  givenMethodRunOutOfGas(
    method: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  invocationCount(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  invocationCountForCalldata(
    call: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  invocationCountForMethod(
    method: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  reset(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    givenAnyReturn(
      response: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenAnyReturnAddress(
      response: string,
      overrides?: CallOverrides
    ): Promise<void>;

    givenAnyReturnBool(
      response: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    givenAnyReturnUint(
      response: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    givenAnyRevert(overrides?: CallOverrides): Promise<void>;

    givenAnyRevertWithMessage(
      message: string,
      overrides?: CallOverrides
    ): Promise<void>;

    givenAnyRunOutOfGas(overrides?: CallOverrides): Promise<void>;

    givenCalldataReturn(
      call: BytesLike,
      response: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenCalldataReturnAddress(
      call: BytesLike,
      response: string,
      overrides?: CallOverrides
    ): Promise<void>;

    givenCalldataReturnBool(
      call: BytesLike,
      response: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    givenCalldataReturnBytes32(
      call: BytesLike,
      response: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenCalldataReturnUint(
      call: BytesLike,
      response: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    givenCalldataRevert(
      call: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenCalldataRevertWithMessage(
      call: BytesLike,
      message: string,
      overrides?: CallOverrides
    ): Promise<void>;

    givenCalldataRunOutOfGas(
      call: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodReturn(
      method: BytesLike,
      response: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodReturnAddress(
      method: BytesLike,
      response: string,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodReturnBool(
      method: BytesLike,
      response: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodReturnBytes32(
      method: BytesLike,
      response: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodReturnUint(
      method: BytesLike,
      response: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodRevert(
      method: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodRevertWithMessage(
      method: BytesLike,
      message: string,
      overrides?: CallOverrides
    ): Promise<void>;

    givenMethodRunOutOfGas(
      method: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    invocationCount(overrides?: CallOverrides): Promise<BigNumber>;

    invocationCountForCalldata(
      call: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    invocationCountForMethod(
      method: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    reset(overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    givenAnyReturn(
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenAnyReturnAddress(
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenAnyReturnBool(
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenAnyReturnUint(
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenAnyRevert(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenAnyRevertWithMessage(
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenAnyRunOutOfGas(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataReturn(
      call: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataReturnAddress(
      call: BytesLike,
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataReturnBool(
      call: BytesLike,
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataReturnBytes32(
      call: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataReturnUint(
      call: BytesLike,
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataRevert(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataRevertWithMessage(
      call: BytesLike,
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenCalldataRunOutOfGas(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodReturn(
      method: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodReturnAddress(
      method: BytesLike,
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodReturnBool(
      method: BytesLike,
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodReturnBytes32(
      method: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodReturnUint(
      method: BytesLike,
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodRevert(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodRevertWithMessage(
      method: BytesLike,
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    givenMethodRunOutOfGas(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    invocationCount(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    invocationCountForCalldata(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    invocationCountForMethod(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    reset(overrides?: Overrides & { from?: string }): Promise<BigNumber>;
  };

  populateTransaction: {
    givenAnyReturn(
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenAnyReturnAddress(
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenAnyReturnBool(
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenAnyReturnUint(
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenAnyRevert(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenAnyRevertWithMessage(
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenAnyRunOutOfGas(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataReturn(
      call: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataReturnAddress(
      call: BytesLike,
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataReturnBool(
      call: BytesLike,
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataReturnBytes32(
      call: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataReturnUint(
      call: BytesLike,
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataRevert(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataRevertWithMessage(
      call: BytesLike,
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenCalldataRunOutOfGas(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodReturn(
      method: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodReturnAddress(
      method: BytesLike,
      response: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodReturnBool(
      method: BytesLike,
      response: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodReturnBytes32(
      method: BytesLike,
      response: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodReturnUint(
      method: BytesLike,
      response: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodRevert(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodRevertWithMessage(
      method: BytesLike,
      message: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    givenMethodRunOutOfGas(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    invocationCount(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    invocationCountForCalldata(
      call: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    invocationCountForMethod(
      method: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    reset(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
