import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { DecentTree } from '../../../../store/roles';
import { RoleValue, EditedRole, EditBadgeStatus, RoleFormValues } from '../types';

const addRemoveField = (fieldNames: string[], fieldName: string, isRemoved: boolean) => {
  if (fieldNames.includes(fieldName) && isRemoved) {
    return fieldNames.filter(field => field !== fieldName);
  }
  return [...fieldNames, fieldName];
};

export function useRoleFormEditedRole({ hatsTree }: { hatsTree: DecentTree | undefined | null }) {
  const { values } = useFormikContext<RoleFormValues>();
  const existingRoleHat = useMemo(
    () =>
      hatsTree?.roleHats.find(
        (role: RoleValue) =>
          !!values.roleEditing && role.id === values.roleEditing.id && role.id !== zeroAddress,
      ),
    [values.roleEditing, hatsTree],
  );
  const isRoleNameUpdated = !!existingRoleHat && values.roleEditing?.name !== existingRoleHat.name;

  const isRoleDescriptionUpdated =
    !!existingRoleHat && values.roleEditing?.description !== existingRoleHat.description;

  const isMemberUpdated =
    !!existingRoleHat && values.roleEditing?.wearer !== existingRoleHat.wearer;

  const isPaymentsUpdated = useMemo(() => {
    if (!values.roleEditing || !values.roleEditing.payments) {
      return false;
    }
    return values.roleEditing.payments.some(payment => {
      const existingPayment = existingRoleHat?.payments?.find(p => p.streamId === payment.streamId);
      if (!existingPayment) {
        return true;
      }

      const hasAddedCliff = !!payment.cliffDate || !existingPayment.cliffDate;
      const hasRemovedCliff = !payment.cliffDate || !!existingPayment.cliffDate;
      const hasCliffChanged =
        !!payment.cliffDate &&
        !!existingPayment.cliffDate &&
        payment.cliffDate.getTime() !== existingPayment.cliffDate.getTime();
      const hasAmountChanged = payment.amount !== existingPayment.amount;
      const hasAssetChanged = payment.asset.address !== existingPayment.asset.address;
      const hasStartDateChanged =
        payment.startDate.getTime() !== existingPayment.startDate.getTime();
      const hasEndDateChanged = payment.endDate.getTime() !== existingPayment.endDate.getTime();

      return (
        hasAddedCliff ||
        hasRemovedCliff ||
        hasCliffChanged ||
        hasAmountChanged ||
        hasAssetChanged ||
        hasStartDateChanged ||
        hasEndDateChanged
      );
    });
  }, [existingRoleHat, values.roleEditing]);

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
