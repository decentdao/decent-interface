import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { Address, Hex } from 'viem';
import { DecentTree } from '../../../../store/roles/rolesStoreUtils';
import { BigIntValuePair } from '../../../../types';
import { EditedRole, EditBadgeStatus } from '../types';

const addRemoveField = (fieldNames: string[], fieldName: string, hasChanges: boolean) => {
  if (fieldNames.includes(fieldName) && !hasChanges) {
    return fieldNames.filter(field => field !== fieldName);
  } else if (!fieldNames.includes(fieldName) && !hasChanges) {
    return fieldNames;
  }
  return [...fieldNames, fieldName];
};

export function useRoleFormEditedRole({ hatsTree }: { hatsTree: DecentTree | undefined | null }) {
  const { values } = useFormikContext<{
    roleEditing?: {
      prettyId?: string;
      name?: string;
      description?: string;
      smartAddress?: Address;
      id: Hex;
      wearer?: string;
      // Not a user-input field.
      // `resolvedWearer` is auto-populated from the resolved address of `wearer` in case it's an ENS name.
      resolvedWearer?: Address;
      payments: {
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
    };
  }>();
  const existingRoleHat = useMemo(
    () =>
      hatsTree?.roleHats.find(role => !!values.roleEditing && role.id === values.roleEditing.id),
    [values.roleEditing, hatsTree],
  );
  const isRoleNameUpdated = !!existingRoleHat && values.roleEditing?.name !== existingRoleHat.name;

  const isRoleDescriptionUpdated =
    !!existingRoleHat && values.roleEditing?.description !== existingRoleHat.description;

  const isMemberUpdated =
    !!existingRoleHat && values.roleEditing?.resolvedWearer !== existingRoleHat.wearerAddress;

  const isPaymentsUpdated = useMemo(() => {
    if (!values.roleEditing || !values.roleEditing.payments) {
      return false;
    }
    return values.roleEditing.payments.some(payment => {
      const hasBeenSetToCancel = payment.isCancelling;
      const isNewPayment = !payment.streamId;
      return hasBeenSetToCancel || isNewPayment;
    });
  }, [values.roleEditing]);

  const editedRoleData = useMemo<EditedRole>(() => {
    if (!existingRoleHat) {
      return {
        fieldNames: [],
        status: EditBadgeStatus.New,
      };
    }
    let fieldNames: string[] = [];
    fieldNames = addRemoveField(fieldNames, 'roleName', isRoleNameUpdated);
    fieldNames = addRemoveField(fieldNames, 'roleDescription', isRoleDescriptionUpdated);
    fieldNames = addRemoveField(fieldNames, 'member', isMemberUpdated);
    fieldNames = addRemoveField(fieldNames, 'payments', isPaymentsUpdated);

    return {
      fieldNames,
      status: EditBadgeStatus.Updated,
    };
  }, [
    existingRoleHat,
    isRoleNameUpdated,
    isRoleDescriptionUpdated,
    isMemberUpdated,
    isPaymentsUpdated,
  ]);

  const isRoleUpdated = useMemo(() => {
    return (
      !!isRoleNameUpdated || !!isRoleDescriptionUpdated || !!isMemberUpdated || !!isPaymentsUpdated
    );
  }, [isRoleNameUpdated, isRoleDescriptionUpdated, isMemberUpdated, isPaymentsUpdated]);

  return {
    existingRoleHat,
    editedRoleData,
    isRoleUpdated,
  };
}
