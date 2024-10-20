import { Box, Button } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, Hex } from 'viem';
import {
  paymentSorterByActiveStatus,
  paymentSorterByStartDate,
  paymentSorterByWithdrawAmount,
} from '../../../../store/roles/rolesStoreUtils';
import { BigIntValuePair } from '../../../../types';
import { ModalType } from '../../../ui/modals/ModalProvider';
import { useDecentModal } from '../../../ui/modals/useDecentModal';
import { RolePaymentDetails } from '../RolePaymentDetails';
import { EditedRole } from '../types';

export function RoleFormPaymentStreams() {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue, validateForm } = useFormikContext<{
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
        isStreaming: boolean;
        isCancellable: boolean;
        isCancelling: boolean;
      }[];
      // form specific state
      editedRole?: EditedRole;
      roleEditingPaymentIndex?: number;
    };
  }>();
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
      {({
        push: pushPayment,
      }: {
        push: (streamFormValue: {
          isStreaming: boolean;
          isCancellable: boolean;
          isCancelling?: boolean;
        }) => void;
      }) => (
        <Box>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size="1rem" />}
            iconSpacing={0}
            onClick={async () => {
              pushPayment({
                isStreaming: false,
                isCancellable: false,
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
              // @note can we just get rid of this?
              // if (!payment.amount || !payment.asset || !payment.startDate || !payment.endDate) {
              //   return null;
              // }

              return (
                <RolePaymentDetails
                  key={index}
                  showCancel={payment.isCancellable || !payment.isCancelling}
                  onClick={
                    payment.isCancellable
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
                    isCancelled: payment.isCancelled,
                    isStreaming: payment.isStreaming,
                    isCancellable: payment.isCancellable,
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
