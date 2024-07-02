import { Address } from 'viem';
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
  handleRoleClick: (hatId: number) => void;
  hatId: number;
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

export interface Role {
  id: number;
  member: string;
  roleName: string;
  roleDescription: string;
  // @todo add vesting and payroll types
}

export interface EditedRole {
  id?: number;
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
  id: -1,
  member: '',
  roleName: '',
  roleDescription: '',
};
