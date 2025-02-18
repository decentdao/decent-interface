import { Button } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { isFeatureEnabled } from '../../helpers/featureFlags';
import { RoleFormValues } from '../../types/roles';

export function Set10MinPaymentStreamButton({ formIndex }: { formIndex: number }) {
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();

  return isFeatureEnabled('flag_dev') ? (
    <Button
      size="sm"
      onClick={() => {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 10 * 60 * 1000); // Add 10 minutes
        setFieldValue(`roleEditing.payments.${formIndex}`, {
          ...values.roleEditing?.payments?.[formIndex],
          startDate,
          endDate,
        });
      }}
      mb={4}
    >
      Set 10 min stream
    </Button>
  ) : null;
}
