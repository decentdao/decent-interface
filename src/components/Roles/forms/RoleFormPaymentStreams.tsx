import { Box, Button } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  paymentSorterByActiveStatus,
  paymentSorterByStartDate,
  paymentSorterByWithdrawAmount,
} from '../../../../store/roles/rolesStoreUtils';
import { ModalType } from '../../../ui/modals/ModalProvider';
import { useDecentModal } from '../../../ui/modals/useDecentModal';
import { RolePaymentDetails } from '../RolePaymentDetails';

export function RoleFormPaymentStreams() {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue, validateForm } = useFormikContext<RoleFormValues>();
  const cancelModal = useDecentModal(ModalType.NONE);
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
            leftIcon={<Plus size="1rem" />}
            iconSpacing={0}
            onClick={async () => {
              pushPayment({
                isStreaming: () => false,
                isCancellable: () => false,
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

              const canBeCancelled = payment.isCancellable();
              return (
                <RolePaymentDetails
                  key={index}
                  showCancel={canBeCancelled || !payment.isCancelling}
                  onClick={
                    canBeCancelled
                      ? () => setFieldValue('roleEditing.roleEditingPaymentIndex', index)
                      : undefined
                  }
                  onCancel={() => {
                    setFieldValue(`roleEditing.payments.${index}`, {
                      ...payment,
                      isCancelling: true,
                    });
                    cancelModal();
                    setFieldValue('roleEditing.roleEditingPaymentIndex', undefined);
                  }}
                  payment={{
                    streamId: payment.streamId,
                    amount: payment.amount,
                    asset: payment.asset,
                    endDate: payment.endDate,
                    startDate: payment.startDate,
                    cliffDate: payment.cliffDate,
                    isCancelled: payment.isCancelled ?? false,
                    isStreaming: payment.isStreaming ?? (() => false),
                    isCancellable: payment.isCancellable ?? (() => false),
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
