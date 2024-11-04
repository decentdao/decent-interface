import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { DecentTree, EditBadgeStatus, EditedRole, RoleFormValues } from '../../../types/roles';

const addRemoveField = (fieldNames: string[], fieldName: string, hasChanges: boolean) => {
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

  const isCanCreateProposalsUpdated =
    !!existingRoleHat &&
    values.roleEditing?.canCreateProposals !== existingRoleHat.canCreateProposals;

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
    fieldNames = addRemoveField(fieldNames, 'canCreateProposals', isCanCreateProposalsUpdated);

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
    isCanCreateProposalsUpdated,
  ]);

  const isRoleUpdated = useMemo(() => {
    return (
      !!isRoleNameUpdated ||
      !!isRoleDescriptionUpdated ||
      !!isMemberUpdated ||
      !!isPaymentsUpdated ||
      !!isCanCreateProposalsUpdated
    );
  }, [
    isRoleNameUpdated,
    isRoleDescriptionUpdated,
    isMemberUpdated,
    isPaymentsUpdated,
    isCanCreateProposalsUpdated,
  ]);

  return {
    existingRoleHat,
    editedRoleData,
    isRoleUpdated,
  };
}
