import { Box, Button, Flex } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
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
              });
              await validateForm();
              setFieldValue('roleEditing.roleEditingPaymentIndex', (payments ?? []).length);
            }}
          >
            {t('addPayment')}
          </Button>
          <Box mt="0.5rem">
            {[...(payments ?? [])]
              .sort(paymentSorterByWithdrawAmount)
              .sort(paymentSorterByStartDate)
              .sort(paymentSorterByActiveStatus)
              .map((payment, index) => {
                // @note don't render if form isn't valid
                if (!payment.amount || !payment.asset || !payment.startDate || !payment.endDate)
                  return null;
                return (
                  <Flex key={index}>
                    <RolePaymentDetails
                      roleHatId={values.roleEditing?.id}
                      showCancel={
                        // @note can not cancel a new role
                        values.roleEditing?.id !== undefined &&
                        // @note can not cancel a pending creation
                        payment.streamId !== undefined &&
                        // @note can not cancel a stream that is already cancelled or ended
                        !payment.isCancelled &&
                        !!payment.endDate &&
                        payment.endDate.getTime() > Date.now()
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
                      }}
                      onClick={() => {
                        setFieldValue('roleEditing.roleEditingPaymentIndex', index);
                      }}
                    />
                  </Flex>
                );
              })}
          </Box>
        </Box>
      )}
    </FieldArray>
  );
}
