import { SafeInfoResponse, TransferResponse } from '@safe-global/safe-service-client';

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
  guard?: string;
};

/**
 * We generally use SafeServiceClient to make requests to the Safe API, however it does not
 * support the /transfers/ endpoint, so we do that via a normal get request instead.
 *
 * This API is paginated, but for our current usage we take the first page, and in
 * the Treasury page have a component to link to Etherscan in the event they want
 * to see more than the first page of assets.
 */
export interface AllTransfersListResponse {
  next: any;
  results: TransferResponse[];
}
