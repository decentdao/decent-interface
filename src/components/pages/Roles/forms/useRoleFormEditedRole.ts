import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { DecentTree } from '../../../../store/roles/rolesStoreUtils';
import { EditedRole, EditBadgeStatus, RoleFormValues, EditedRoleFieldNames } from '../types';

const addRemoveField = (
  fieldNames: EditedRoleFieldNames[],
  fieldName: EditedRoleFieldNames,
  hasChanges: boolean,
): EditedRoleFieldNames[] => {
  if (fieldNames.includes(fieldName) && !hasChanges) {
    return fieldNames.filter(field => field !== fieldName);
  } else if (!fieldNames.includes(fieldName) && !hasChanges) {
    return fieldNames;
  }
  return [...fieldNames, fieldName];
};

export function useRoleFormEditedRole({ hatsTree }: { hatsTree: DecentTree | undefined | null }) {
  const { values } = useFormikContext<RoleFormValues>();
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

  const isRoleTypeUpdated = useMemo(() => {
    const isTermToggled = !!values.roleEditing?.isTermed;
    const isExistingRoleNotTerm = !!existingRoleHat && !existingRoleHat.isTermed;
    return isExistingRoleNotTerm && isTermToggled;
  }, [existingRoleHat, values.roleEditing]);

  const isRoleTermUpdated = useMemo(() => {
    return (
      !!existingRoleHat &&
      values.roleEditing?.roleTerms?.length !== existingRoleHat.roleTerms.allTerms.length
    );
  }, [existingRoleHat, values.roleEditing]);

  const editedRoleData = useMemo<EditedRole>(() => {
    if (!existingRoleHat) {
      return {
        fieldNames: [],
        status: EditBadgeStatus.New,
      };
    }
    let fieldNames: EditedRoleFieldNames[] = [];
    fieldNames = addRemoveField(fieldNames, 'roleName', isRoleNameUpdated);
    fieldNames = addRemoveField(fieldNames, 'roleDescription', isRoleDescriptionUpdated);
    fieldNames = addRemoveField(fieldNames, 'member', isMemberUpdated);
    fieldNames = addRemoveField(fieldNames, 'payments', isPaymentsUpdated);
    fieldNames = addRemoveField(fieldNames, 'roleType', isRoleTypeUpdated);
    fieldNames = addRemoveField(fieldNames, 'newTerm', isRoleTermUpdated);

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
    isRoleTypeUpdated,
    isRoleTermUpdated,
  ]);

  const isRoleUpdated = useMemo(() => {
    return (
      !!isRoleNameUpdated ||
      !!isRoleDescriptionUpdated ||
      !!isMemberUpdated ||
      !!isPaymentsUpdated ||
      !!isRoleTypeUpdated ||
      !!isRoleTermUpdated
    );
  }, [
    isRoleNameUpdated,
    isRoleDescriptionUpdated,
    isMemberUpdated,
    isPaymentsUpdated,
    isRoleTypeUpdated,
    isRoleTermUpdated,
  ]);

  return {
    existingRoleHat,
    editedRoleData,
    isRoleUpdated,
  };
}
