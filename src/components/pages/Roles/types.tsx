import { Address, Hex } from 'viem';
import { toHex } from 'viem/utils';
import { getRandomBytes } from '../../../helpers';
import { DecentRoleHat } from '../../../state/useRolesState';
import { CreateProposalMetadata } from '../../../types';
export type RoleViewMode = 'edit' | 'view';

export interface SablierVesting {
  vestingSchedule: string;
  vestingAmount: string;
  vestingAmountUSD: string;
  vestingStartDate: string;
  vestingEndDate: string;
  asset: {
    address: Address;
    symbol: string;
    name: string;
    iconUri: string;
  };
}

export interface SablierPayroll {
  payrollSchedule: string;
  payrollAmount: string;
  payrollAmountUSD: string;
  payrollStartDate: string;
  payrollEndDate: string;
  asset: {
    address: Address;
    symbol: string;
    name: string;
    iconUri: string;
  };
}
export interface RoleProps {
  editStatus?: EditBadgeStatus;
  handleRoleClick: (hatId: Address) => void;
  hatId: Address;
  name: string;
  wearerAddress: Address | undefined;
  vestingData?: SablierVesting;
  payrollData?: SablierPayroll;
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
  [EditBadgeStatus.Removed]: 'error-1',
};

export interface HatStruct {
  eligibility: Address; // The address that can report on the Hat wearer's status
  toggle: Address; // The address that can deactivate the Hat
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

export interface RoleValue extends Omit<DecentRoleHat, 'wearer'> {
  wearer: string;
  editedRole?: EditedRole;
}

export interface RoleFormValues {
  proposalMetadata: CreateProposalMetadata;
  hats: RoleValue[];
  roleEditing?: RoleValue;
}

export const DEFAULT_ROLE_HAT: RoleValue = {
  // @dev creates a unique id for the hat for new hats for use in form, not stored on chain
  id: toHex(getRandomBytes(), { size: 32 }),
  wearer: '',
  name: '',
  description: '',
  prettyId: '',
};

export interface HatWearerChangedParams {
  id: Address;
  currentWearer: Address;
  newWearer: Address;
}
