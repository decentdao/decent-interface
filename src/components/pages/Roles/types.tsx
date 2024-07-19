import { Address, Hex, zeroAddress } from 'viem';
import { toHex } from 'viem/utils';
import { getRandomBytes } from '../../../helpers';
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

export interface SablierVesting {
  asset: SablierAsset;
  vestingSchedule: string;
  vestingAmount: string;
  vestingAmountUSD: string;
  vestingStartDate: string;
  vestingEndDate: string;
}

export interface SablierPayroll {
  asset: SablierAsset;
  amount: BigIntValuePair;
  paymentFrequency: Frequency;
  paymentStartDate: Date;
  paymentFrequencyNumber: number;
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

export interface VestingDuration {
  years: number;
  hours: number;
  days: number;
}

export interface RoleFormVestingValue {
  asset: {
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
  };
  vestingAmount: BigIntValuePair;
  scheduleDuration?: {
    vestingDuration: VestingDuration;
    cliffDuration: VestingDuration;
  };
  scheduleFixedDate?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface RoleValue extends Omit<DecentRoleHat, 'wearer'> {
  wearer: string;
  editedRole?: EditedRole;
  payroll?: SablierPayroll;
  vesting?: RoleFormVestingValue;
}

export interface RoleFormValues {
  proposalMetadata: CreateProposalMetadata;
  hats: RoleValue[];
  roleEditing?: RoleValue;
  customNonce?: number;
}

export function getNewRole(): RoleValue {
  // @dev creates a unique id for the hat for new hats for use in form, not stored on chain
  return {
    id: toHex(getRandomBytes(), { size: 32 }),
    wearer: '',
    name: '',
    description: '',
    prettyId: '',
    smartAddress: zeroAddress,
  };
}

export interface HatWearerChangedParams {
  id: Address;
  currentWearer: Address;
  newWearer: Address;
}

export enum Frequency {
  Monthly,
  EveryTwoWeeks,
  Weekly,
}

export const frequencyOptions: Record<string, string> = {
  [Frequency.Monthly]: 'monthly',
  [Frequency.EveryTwoWeeks]: 'everyTwoWeeks',
  [Frequency.Weekly]: 'weekly',
};
export const frequencyAmountLabel: Record<string, string> = {
  [Frequency.Monthly]: 'months',
  [Frequency.EveryTwoWeeks]: 'weeks',
  [Frequency.Weekly]: 'weeks',
};
