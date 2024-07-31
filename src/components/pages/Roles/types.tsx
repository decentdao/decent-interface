import { Address, Hex } from 'viem';
import { DecentRoleHat } from '../../../state/useRolesState';
import { BigIntValuePair, CreateProposalMetadata } from '../../../types';
export type RoleViewMode = 'edit' | 'view';

export interface SablierAsset {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
}

export interface BaseSablierStream {
  streamId: string;
  contractAddress: Address;
  asset: SablierAsset;
  amount: BigIntValuePair;
}

export interface SablierPayment extends BaseSablierStream {
  scheduleDuration?: {
    duration: DurationBreakdown;
    cliffDuration: DurationBreakdown | undefined;
  };
  scheduleFixedDate?: {
    startDate: Date;
    endDate: Date;
    cliffDate: Date | undefined;
  };
  scheduleType: 'duration' | 'fixedDate';
}

export interface RoleProps {
  editStatus?: EditBadgeStatus;
  handleRoleClick: (hatId: Address) => void;
  hatId: Address;
  name: string;
  wearerAddress: Address | undefined;
  payments?: SablierPayment[];
}

export interface RoleEditProps
  extends Omit<RoleProps, 'hatId' | 'wearerAddress' | 'handleRoleClick'> {
  handleRoleClick: () => void;
  wearerAddress: string | undefined;
}

export enum EditBadgeStatus {
  Updated,
  New,
  Removed,
}
export const BadgeStatus: Record<EditBadgeStatus, string> = {
  [EditBadgeStatus.Updated]: 'updated',
  [EditBadgeStatus.New]: 'new',
  [EditBadgeStatus.Removed]: 'removed',
};
export const BadgeStatusColor: Record<EditBadgeStatus, string> = {
  [EditBadgeStatus.Updated]: 'lilac-0',
  [EditBadgeStatus.New]: 'celery--2',
  [EditBadgeStatus.Removed]: 'red-1',
};

export interface HatStruct {
  maxSupply: number; // No more than this number of wearers. Hardcode to 1
  details: string; // IPFS url/hash to JSON { version: '1.0', data: { name, description, ...arbitraryData } }
  imageURI: string;
  isMutable: boolean; // true
  wearer: Address;
}

export interface HatStructWithId extends HatStruct {
  id: Hex; // uint256 with padded zeros for the tree ID
}

export interface EditedRole {
  fieldNames: string[];
  status: EditBadgeStatus;
}

export interface DurationBreakdown {
  years: number;
  hours: number;
  days: number;
}

export interface RoleValue extends Omit<DecentRoleHat, 'wearer'> {
  wearer: string;
  editedRole?: EditedRole;
  payments?: SablierPayment[];
}

export interface RoleFormValues {
  proposalMetadata: CreateProposalMetadata;
  hats: RoleValue[];
  roleEditing?: RoleValue;
  customNonce?: number;
}

export interface HatWearerChangedParams {
  id: Address;
  currentWearer: Address;
  newWearer: Address;
}
