import { Box, Button } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  paymentSorterByWithdrawAmount,
  paymentSorterByStartDate,
  paymentSorterByActiveStatus,
} from '../../../../store/roles';
import { RolePaymentDetails } from '../RolePaymentDetails';
import { RoleFormValues, SablierPaymentFormValues } from '../types';

export function RoleFormPaymentStreams() {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue, validateForm } = useFormikContext<RoleFormValues>();
  const payments = values.roleEditing?.payments;

  const sortedPayments = useMemo(
    () =>
      payments
        ? [...payments]
            .sort(paymentSorterByWithdrawAmount)
            .sort(paymentSorterByStartDate)
            .sort(paymentSorterByActiveStatus)
        : [],
    [payments],
  );

  return (
    <FieldArray name="roleEditing.payments">
      {({ push: pushPayment }: { push: (streamFormValue: SablierPaymentFormValues) => void }) => (
        <Box>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus />}
            onClick={async () => {
              pushPayment({
                isStreaming: () => false,
                isCancelling: false,
              });
              await validateForm();
              setFieldValue('roleEditing.roleEditingPaymentIndex', (payments ?? []).length);
            }}
          >
            {t('addPayment')}
          </Button>
          <Box mt="0.5rem">
            {sortedPayments.map((payment, index) => {
              // @note don't render if form isn't valid
              if (!payment.amount || !payment.asset || !payment.startDate || !payment.endDate)
                return null;

              const canBeCancelled =
                // @note can not cancel a payment on a new role
                values.roleEditing?.id !== undefined &&
                // @note can not cancel a pending creation
                payment.streamId !== undefined &&
                // @note can not cancel a stream that is already cancelled or ended
                !payment.isCancelled &&
                !!payment.endDate &&
                payment.endDate.getTime() > Date.now();
              return (
                <RolePaymentDetails
                  key={index}
                  showCancel={canBeCancelled}
                  onClick={
                    canBeCancelled
                      ? () => setFieldValue('roleEditing.roleEditingPaymentIndex', index)
                      : undefined
                  }
                  payment={{
                    streamId: payment.streamId,
                    amount: payment.amount,
                    asset: payment.asset,
                    endDate: payment.endDate,
                    startDate: payment.startDate,
                    cliffDate: payment.cliffDate,
                    isCancelled: payment.isCancelled ?? false,
                    isStreaming: payment.isStreaming ?? (() => false),
                    isCancelling: payment.isCancelling,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}
    </FieldArray>
  );
}
