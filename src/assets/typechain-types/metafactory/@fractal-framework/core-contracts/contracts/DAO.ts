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
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../common";

export interface DAOInterface extends utils.Interface {
  functions: {
    "accessControl()": FunctionFragment;
    "execute(address[],uint256[],bytes[])": FunctionFragment;
    "initialize(address,address,string)": FunctionFragment;
    "moduleFactory()": FunctionFragment;
    "name()": FunctionFragment;
    "proxiableUUID()": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "upgradeTo(address)": FunctionFragment;
    "upgradeToAndCall(address,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "accessControl"
      | "execute"
      | "initialize"
      | "moduleFactory"
      | "name"
      | "proxiableUUID"
      | "supportsInterface"
      | "upgradeTo"
      | "upgradeToAndCall"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "accessControl",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "execute",
    values: [string[], BigNumberish[], BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "moduleFactory",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "upgradeTo", values: [string]): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [string, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "accessControl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "moduleFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;

  events: {
    "AdminChanged(address,address)": EventFragment;
    "BeaconUpgraded(address)": EventFragment;
    "Executed(address[],uint256[],bytes[])": EventFragment;
    "Initialized(uint8)": EventFragment;
    "Upgraded(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BeaconUpgraded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Executed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
}

export interface AdminChangedEventObject {
  previousAdmin: string;
  newAdmin: string;
}
export type AdminChangedEvent = TypedEvent<
  [string, string],
  AdminChangedEventObject
>;

export type AdminChangedEventFilter = TypedEventFilter<AdminChangedEvent>;

export interface BeaconUpgradedEventObject {
  beacon: string;
}
export type BeaconUpgradedEvent = TypedEvent<
  [string],
  BeaconUpgradedEventObject
>;

export type BeaconUpgradedEventFilter = TypedEventFilter<BeaconUpgradedEvent>;

export interface ExecutedEventObject {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
}
export type ExecutedEvent = TypedEvent<
  [string[], BigNumber[], string[]],
  ExecutedEventObject
>;

export type ExecutedEventFilter = TypedEventFilter<ExecutedEvent>;

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface UpgradedEventObject {
  implementation: string;
}
export type UpgradedEvent = TypedEvent<[string], UpgradedEventObject>;

export type UpgradedEventFilter = TypedEventFilter<UpgradedEvent>;

export interface DAO extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: DAOInterface;

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
    accessControl(overrides?: CallOverrides): Promise<[string]>;

    execute(
      targets: string[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    initialize(
      _accessControl: string,
      _moduleFactoryBase: string,
      _name: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    moduleFactory(overrides?: CallOverrides): Promise<[string]>;

    name(overrides?: CallOverrides): Promise<[string]>;

    proxiableUUID(overrides?: CallOverrides): Promise<[string]>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    upgradeTo(
      newImplementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  accessControl(overrides?: CallOverrides): Promise<string>;

  execute(
    targets: string[],
    values: BigNumberish[],
    calldatas: BytesLike[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  initialize(
    _accessControl: string,
    _moduleFactoryBase: string,
    _name: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  moduleFactory(overrides?: CallOverrides): Promise<string>;

  name(overrides?: CallOverrides): Promise<string>;

  proxiableUUID(overrides?: CallOverrides): Promise<string>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  upgradeTo(
    newImplementation: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  upgradeToAndCall(
    newImplementation: string,
    data: BytesLike,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    accessControl(overrides?: CallOverrides): Promise<string>;

    execute(
      targets: string[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      overrides?: CallOverrides
    ): Promise<void>;

    initialize(
      _accessControl: string,
      _moduleFactoryBase: string,
      _name: string,
      overrides?: CallOverrides
    ): Promise<void>;

    moduleFactory(overrides?: CallOverrides): Promise<string>;

    name(overrides?: CallOverrides): Promise<string>;

    proxiableUUID(overrides?: CallOverrides): Promise<string>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    upgradeTo(
      newImplementation: string,
      overrides?: CallOverrides
    ): Promise<void>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AdminChanged(address,address)"(
      previousAdmin?: null,
      newAdmin?: null
    ): AdminChangedEventFilter;
    AdminChanged(
      previousAdmin?: null,
      newAdmin?: null
    ): AdminChangedEventFilter;

    "BeaconUpgraded(address)"(
      beacon?: string | null
    ): BeaconUpgradedEventFilter;
    BeaconUpgraded(beacon?: string | null): BeaconUpgradedEventFilter;

    "Executed(address[],uint256[],bytes[])"(
      targets?: null,
      values?: null,
      calldatas?: null
    ): ExecutedEventFilter;
    Executed(
      targets?: null,
      values?: null,
      calldatas?: null
    ): ExecutedEventFilter;

    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "Upgraded(address)"(implementation?: string | null): UpgradedEventFilter;
    Upgraded(implementation?: string | null): UpgradedEventFilter;
  };

  estimateGas: {
    accessControl(overrides?: CallOverrides): Promise<BigNumber>;

    execute(
      targets: string[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    initialize(
      _accessControl: string,
      _moduleFactoryBase: string,
      _name: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    moduleFactory(overrides?: CallOverrides): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    proxiableUUID(overrides?: CallOverrides): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    upgradeTo(
      newImplementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    accessControl(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    execute(
      targets: string[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    initialize(
      _accessControl: string,
      _moduleFactoryBase: string,
      _name: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    moduleFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    proxiableUUID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    upgradeTo(
      newImplementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    upgradeToAndCall(
      newImplementation: string,
      data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
