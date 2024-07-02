import { Address, zeroAddress } from 'viem';
import { CreateProposalMetadata } from '../../../types';

export type RoleViewMode = 'edit' | 'view';

export interface SablierVesting {
  vestingSchedule: string;
  vestingAmount: string;
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
  asset: {
    address: Address;
    symbol: string;
    name: string;
    iconUri: string;
  };
}
export interface RoleProps {
  editStatus?: EditBadgeStatus;
  handleRoleClick: (hatId: bigint) => void;
  hatId: bigint;
  roleName: string;
  wearerAddress: string | undefined;
  vestingData?: SablierVesting;
  payrollData?: SablierPayroll;
}

export interface RoleEditProps extends Omit<RoleProps, 'hatId'> {
  handleRoleClick: () => void;
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
  details: string; // JSON string, { name, description } OR IPFS url/hash to said JSON data
  imageURI: string;
  isMutable: boolean; // true
  wearer: Address;
}

export interface HatStructWithId extends HatStruct {
  id: bigint;
}

export interface Role {
  id: bigint;
  member: Address;
  roleName: string;
  roleDescription: string;
  // @todo add vesting and payroll types
}

export interface EditedRole {
  id?: bigint;
  fieldNames: string[];
  status: EditBadgeStatus;
}

export interface RoleValue extends Role {
  editedRole?: EditedRole;
}

export interface RoleFormValues {
  proposalMetadata: CreateProposalMetadata;
  hats: RoleValue[];
}

export const DEFAULT_ROLE_HAT: RoleValue = {
  id: -1n,
  member: zeroAddress, // @todo: confirm this is fine when used on the add role form
  roleName: '',
  roleDescription: '',
};
