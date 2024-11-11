import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { DecentTree, RoleFormValues } from '../../../types/roles';

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

  const isRoleUpdated = useMemo(() => {
    return (
      !!isRoleNameUpdated ||
      !!isRoleDescriptionUpdated ||
      !!isMemberUpdated ||
      !!isPaymentsUpdated ||
      !!isCanCreateProposalsUpdated ||
      !!isRoleTypeUpdated ||
      !!isRoleTermUpdated
    );
  }, [
    isRoleNameUpdated,
    isRoleDescriptionUpdated,
    isMemberUpdated,
    isPaymentsUpdated,
    isCanCreateProposalsUpdated,
    isRoleTypeUpdated,
    isRoleTermUpdated,
  ]);

  return {
    existingRoleHat,
    isRoleUpdated,
  };
}
