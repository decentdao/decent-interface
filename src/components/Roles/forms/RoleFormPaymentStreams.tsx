import { Box, Button } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  paymentSorterByActiveStatus,
  paymentSorterByStartDate,
  paymentSorterByWithdrawAmount,
} from '../../../store/roles/rolesStoreUtils';
import { RoleFormValues, SablierPaymentFormValues } from '../../../types/roles';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useDecentModal } from '../../ui/modals/useDecentModal';
import { RolePaymentDetails } from '../RolePaymentDetails';
import RoleFormPaymentStream from './RoleFormPaymentStream';
import RoleFormPaymentStreamTermed from './RoleFormPaymentStreamTermed';

export function RoleFormPaymentRenderer() {
  const { values } = useFormikContext<RoleFormValues>();

  if (values.roleEditing?.roleEditingPaymentIndex !== undefined) {
    if (values.roleEditing?.isTermed) {
      return (
        <RoleFormPaymentStreamTermed paymentIndex={values.roleEditing.roleEditingPaymentIndex} />
      );
    } else {
      return <RoleFormPaymentStream formIndex={values.roleEditing.roleEditingPaymentIndex} />;
    }
  }

  return null;
}

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

  const isTermsAvailable = useMemo(() => {
    return values.roleEditing?.roleTerms?.some(term => {
      if (!term.termEndDate) {
        return false;
      }
      return term.termEndDate > new Date();
    });
  }, [values.roleEditing?.roleTerms]);

  const roleTerms = useMemo(() => {
    const terms =
      values.roleEditing?.roleTerms?.map(term => {
        if (!term.termEndDate || !term.nominee) {
          return undefined;
        }
        return {
          termEndDate: term.termEndDate,
          termNumber: term.termNumber,
          nominee: term.nominee,
        };
      }) || [];
    return terms.filter(term => !!term);
  }, [values.roleEditing?.roleTerms]);

  return (
    <FieldArray name="roleEditing.payments">
      {({ push: pushPayment }: { push: (streamFormValue: SablierPaymentFormValues) => void }) => (
        <Box>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={values.roleEditing?.isTermed ? !isTermsAvailable : false}
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
          <RoleFormPaymentRenderer />
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
                  roleTerms={roleTerms}
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
