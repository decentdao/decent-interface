import { SafeInfoResponse } from '@safe-global/api-kit';

export declare enum Operation {
  CALL = 0,
  DELEGATE = 1,
}
export declare type InternalTransaction = {
  operation: Operation;
  to: string;
  value?: string;
  data?: string;
  dataDecoded?: DataDecoded;
};
export declare type ValueDecodedType = InternalTransaction[];

export type ParamValue = string | ParamValue[];

export type Parameter = {
  name: string;
  type: string;
  value: ParamValue;
  valueDecoded?: ValueDecodedType;
};

export declare type DataDecoded = {
  method: string;
  parameters?: Parameter[];
};

export type SafeInfoResponseWithGuard = SafeInfoResponse & {
  nextNonce: number;
  guard: string;
};
