import { Address, Hex } from 'viem';
import { DecentRoleHat } from '../../../store/roles';
import { BigIntValuePair, CreateProposalMetadata } from '../../../types';
import { SendAssetsData } from '../../ui/modals/SendAssetsModal';

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
  startDate: Date;
  endDate: Date;
  cliffDate: Date | undefined;
  isStreaming: () => boolean;
  isCancellable: () => boolean;
  withdrawableAmount: bigint;
  isCancelled: boolean;
}

export interface SablierPaymentFormValues extends Partial<SablierPayment> {
  isStreaming: () => boolean;
  isCancellable: () => boolean;
  isCancelling?: boolean;
}

export interface RoleProps {
  editStatus?: EditBadgeStatus;
  handleRoleClick: (hatId: Address) => void;
  hatId: Address;
  name: string;
  wearerAddress: Address | undefined;
  paymentsCount?: number;
}

export interface RoleEditProps
  extends Omit<
    RoleProps,
    'hatId' | 'wearerAddress' | 'handleRoleClick' | 'paymentsCount' | 'name'
  > {
  name?: string;
  handleRoleClick: () => void;
  wearer: Address | undefined;
  payments?: SablierPaymentFormValues[];
}

export interface RoleDetailsDrawerRoleHatProp
  extends Omit<DecentRoleHat, 'payments' | 'smartAddress'> {
  smartAddress?: Address;
  payments?: (Omit<SablierPayment, 'contractAddress' | 'streamId'> & {
    contractAddress?: Address;
    streamId?: string;
  })[];
}

export interface RoleDetailsDrawerEditingRoleHatProp
  extends Omit<RoleDetailsDrawerRoleHatProp, 'wearerAddress'> {
  wearer: string;
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
  maxSupply: 1; // No more than this number of wearers. Hardcode to 1
  details: string; // IPFS url/hash to JSON { version: '1.0', data: { name, description, ...arbitraryData } }
  imageURI: string;
  isMutable: boolean; // true
  wearer: Address;
}

export interface HatStructWithPayments extends HatStruct {
  sablierParams: {
    sablier: Address;
    sender: Address;
    totalAmount: bigint;
    asset: Address;
    cancelable: boolean;
    transferable: boolean;
    timestamps: { start: number; cliff: number; end: number };
    broker: { account: Address; fee: bigint };
  }[];
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

export interface RoleHatFormValue
  extends Partial<Omit<DecentRoleHat, 'id' | 'wearerAddress' | 'payments'>> {
  id: Hex;
  wearer?: string;
  // Not a user-input field.
  // `resolvedWearer` is auto-populated from the resolved address of `wearer` in case it's an ENS name.
  resolvedWearer?: Address;
  payments?: SablierPaymentFormValues[];
  // form specific state
  editedRole?: EditedRole;
  roleEditingPaymentIndex?: number;
}

export interface RoleHatFormValueEdited extends RoleHatFormValue {
  editedRole: EditedRole;
}

export interface RoleFormValues {
  proposalMetadata: CreateProposalMetadata;
  hats: RoleHatFormValue[];
  roleEditing?: RoleHatFormValue;
  customNonce?: number;
  actions: SendAssetsData[];
}

export type PreparedAddedHatsData = HatStruct & { id: bigint };

export type PreparedMemberChangeData = {
  id: Address;
  currentWearer: Address;
  newWearer: Address;
};

export type PreparedChangedRoleDetailsData = {
  id: Hex;
  details: string;
};

export type AddedHatsWithIds = {
  id: bigint;
  editedRole: EditedRole;
  wearer: Address;
  payments?: SablierPaymentFormValues[];
  roleEditingPaymentIndex?: number;
  prettyId?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  details: string;
  formId: Hex;
};

export type PreparedNewStreamData = {
  recipient: Address;
  startDateTs: number;
  endDateTs: number;
  cliffDateTs: number;
  totalAmount: bigint;
  assetAddress: Address;
};

/**
 * Prepared Stream data with streamId
 */
export type PreparedEditedStreamData = PreparedNewStreamData & {
  streamId: string;
  roleHatId: bigint;
  roleHatWearer: Address;
  roleHatSmartAddress: Address;
  streamContractAddress: Address;
};

export interface RoleDetailsDrawerProps {
  roleHat: RoleDetailsDrawerRoleHatProp | RoleDetailsDrawerEditingRoleHatProp;
  onOpen?: () => void;
  onClose: () => void;
  onEdit: (hatId: Hex) => void;
  isOpen?: boolean;
}
