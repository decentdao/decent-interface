import { Address, Hex } from 'viem';
import { DecentRoleHat } from '../../../store/roles/rolesStoreUtils';
import { BigIntValuePair, CreateProposalMetadata } from '../../../types';
import { SendAssetsData } from '../../ui/modals/SendAssetsModal';

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

export interface EditedRole {
  fieldNames: string[];
  status: EditBadgeStatus;
}

export interface RoleHatFormValue
  extends Partial<Omit<DecentRoleHat, 'id' | 'wearerAddress' | 'payments'>> {
  id: Hex;
  wearer?: string;
  // Not a user-input field.
  // `resolvedWearer` is auto-populated from the resolved address of `wearer` in case it's an ENS name.
  resolvedWearer?: Address;
  payments?: {
    streamId: string;
    contractAddress: Address;
    asset: {
      address: Address;
      name: string;
      symbol: string;
      decimals: number;
      logo: string;
    };
    amount: BigIntValuePair;
    startDate: Date;
    endDate: Date;
    cliffDate?: Date;
    withdrawableAmount: bigint;
    isCancelled: boolean;
    isStreaming: () => boolean;
    isCancellable: () => boolean;
    isCancelling: boolean;
  }[];
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

export interface RoleDetailsDrawerProps {
  roleHat:
    | (Omit<DecentRoleHat, 'smartAddress'> & { smartAddress?: Address })
    | (Omit<DecentRoleHat, 'smartAddress' | 'wearerAddress'> & {
        smartAddress?: Address;
        wearer: string;
      });
  onOpen?: () => void;
  onClose: () => void;
  onEdit: (hatId: Hex) => void;
  isOpen?: boolean;
}
