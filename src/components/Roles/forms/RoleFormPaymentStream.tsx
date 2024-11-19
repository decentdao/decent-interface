import { Alert, Box, Button, Flex, FormControl, Icon, Show, Text } from '@chakra-ui/react';
import { ArrowRight, Info, Trash } from '@phosphor-icons/react';
import { addDays, addMinutes } from 'date-fns';
import { Field, FieldProps, FormikErrors, useFormikContext } from 'formik';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW, isDevMode } from '../../../constants/common';
import { useRolesStore } from '../../../store/roles/useRolesStore';
import { RoleFormValues, RoleHatFormValue } from '../../../types/roles';
import { DatePicker } from '../../ui/forms/DatePicker';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useDecentModal } from '../../ui/modals/useDecentModal';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function FixedDate({ formIndex, disabled }: { formIndex: number; disabled: boolean }) {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const payment = values?.roleEditing?.payments?.[formIndex];

  // Show cliff date picker if both start and end dates are set and if there is at least a day between them
  const showCliffDatePicker =
    !!payment?.startDate && !!payment?.endDate && addDays(payment.startDate, 1) < payment.endDate;

  const onDateChange = (date: Date, type: 'startDate' | 'endDate') => {
    if (!payment) return;

    const startDate = type === 'startDate' ? date : payment.startDate;
    const endDate = type === 'endDate' ? date : payment.endDate;

    setFieldValue(`roleEditing.payments.${formIndex}`, {
      ...payment,
      startDate,
      endDate,
    });

    // If this date change interferes with the cliff date, reset the cliff date
    const cliffDate = payment.cliffDate;
    if (cliffDate && ((startDate && startDate >= cliffDate) || (endDate && endDate <= cliffDate))) {
      setFieldValue(`roleEditing.payments.${formIndex}.cliffDate`, undefined);
    }
  };

  const selectedStartDate = values?.roleEditing?.payments?.[formIndex]?.startDate;
  const selectedEndDate = values?.roleEditing?.payments?.[formIndex]?.endDate;

  return (
    <Box>
      <FormControl my="1rem">
        <Flex
          gap="0.5rem"
          alignItems="center"
        >
          <Field name={`roleEditing.payments.[${formIndex}].startDate`}>
            {({ field }: FieldProps<Date, RoleFormValues>) => (
              <DatePicker
                onChange={(date: Date) => onDateChange(date, 'startDate')}
                selectedDate={field.value}
                maxDate={selectedEndDate ? addDays(selectedEndDate, -1) : undefined}
                disabled={disabled}
              />
            )}
          </Field>
          <Icon
            as={ArrowRight}
            boxSize="1.5rem"
            color="lilac-0"
          />
          <Field name={`roleEditing.payments.[${formIndex}].endDate`}>
            {({ field }: FieldProps<Date, RoleFormValues>) => (
              <DatePicker
                onChange={(date: Date) => onDateChange(date, 'endDate')}
                selectedDate={field.value}
                minDate={selectedStartDate ? addDays(selectedStartDate, 1) : undefined}
                disabled={disabled}
              />
            )}
          </Field>
        </Flex>
      </FormControl>
      {showCliffDatePicker && (
        <FormControl
          my="1rem"
          display="flex"
          flexDir="column"
          gap="1rem"
        >
          <SectionTitle
            title={t('cliff')}
            tooltipContent={t('cliffSubTitle')}
          />
          <Field name={`roleEditing.payments.[${formIndex}].cliffDate`}>
            {({ field }: FieldProps<Date, RoleFormValues>) => (
              <DatePicker
                onChange={(date: Date) =>
                  setFieldValue(`roleEditing.payments.${formIndex}.cliffDate`, date)
                }
                selectedDate={field.value}
                minDate={selectedStartDate ? addDays(selectedStartDate, 1) : undefined}
                maxDate={selectedEndDate ? addDays(selectedEndDate, -1) : undefined}
                disabled={disabled}
              />
            )}
          </Field>
        </FormControl>
      )}
    </Box>
  );
}

export default function RoleFormPaymentStream({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();
  const { getPayment } = useRolesStore();
  const roleEditingPaymentsErrors = (errors.roleEditing as FormikErrors<RoleHatFormValue>)
    ?.payments;
  const hatId = values.roleEditing?.id;
  const payment = useMemo(
    () => values.roleEditing?.payments?.[formIndex],
    [formIndex, values.roleEditing?.payments],
  );
  const streamId = values.roleEditing?.payments?.[formIndex]?.streamId;

  const existingPayment = useMemo(
    () => (!!streamId && !!hatId ? getPayment(hatId, streamId) : undefined),
    [hatId, streamId, getPayment],
  );

  const canBeCancelled = existingPayment
    ? existingPayment.isCancellable() && !payment?.isCancelling
    : false;

  const cancelModal = useDecentModal(ModalType.NONE);
  const handleConfirmCancelPayment = useCallback(() => {
    if (!payment) {
      return;
    }

    setFieldValue(`roleEditing.payments.${formIndex}`, { ...payment, isCancelling: true });
    cancelModal();
    setFieldValue('roleEditing.roleEditingPaymentIndex', undefined);
  }, [setFieldValue, formIndex, cancelModal, payment]);

  const confirmCancelPayment = useDecentModal(ModalType.CONFIRM_CANCEL_PAYMENT, {
    onSubmit: handleConfirmCancelPayment,
  });

  return (
    <>
      <Box
        px={{ base: '1rem', md: 0 }}
        py="1rem"
        bg="neutral-2"
        boxShadow={{
          base: CARD_SHADOW,
          md: 'unset',
        }}
        borderRadius="0.5rem"
        position="relative"
      >
        <SectionTitle
          title={t('asset')}
          tooltipContent={t('addPaymentStreamSubTitle')}
          externalLink="https://docs.decentdao.org/app/user-guide/roles-and-streaming/streaming-payroll-and-vesting"
        />
        <AssetSelector
          formIndex={formIndex}
          disabled={!!streamId}
        />
        <SectionTitle
          title={t('schedule')}
          tooltipContent={t('scheduleSubTitle')}
        />
        <FixedDate
          formIndex={formIndex}
          disabled={!!streamId}
        />
        {canBeCancelled && (
          <Show above="md">
            <Alert
              status="info"
              mt="2rem"
              mb="2.5rem"
              gap="1rem"
            >
              <Box
                width="1.5rem"
                height="1.5rem"
              >
                <Info size="24" />
              </Box>
              <Text
                textStyle="body-base-strong"
                whiteSpace="pre-wrap"
              >
                {t('cancelPaymentInfoMessage')}
              </Text>
            </Alert>
          </Show>
        )}
        {(canBeCancelled || !streamId) && (
          <Flex justifyContent="flex-end">
            {!streamId && (
              <Button
                isDisabled={!!roleEditingPaymentsErrors}
                onClick={() => {
                  setFieldValue('roleEditing.roleEditingPaymentIndex', undefined);
                }}
              >
                {t('save')}
              </Button>
            )}
            {isDevMode() && (
              <Button
                onClick={() => {
                  if (payment === undefined) {
                    return;
                  }
                  const nowDate = new Date();
                  setFieldValue(`roleEditing.payments.${formIndex}`, {
                    ...payment,
                    amount: {
                      value: '100',
                      bigintValue: 100000000000000000000n,
                    },
                    startDate: addMinutes(nowDate, 1),
                    endDate: addMinutes(nowDate, 10),
                  });
                }}
              >
                Ze stream ends in 10!
              </Button>
            )}
            {canBeCancelled && (
              <Show above="md">
                <Button
                  color="red-1"
                  borderColor="red-1"
                  _hover={{ color: 'red-0', borderColor: 'red-0' }}
                  variant="secondary"
                  leftIcon={<Trash />}
                  onClick={confirmCancelPayment}
                >
                  {t('cancelPayment')}
                </Button>
              </Show>
            )}
          </Flex>
        )}
      </Box>
      <Show below="md">
        <Alert
          status="info"
          my="1.5rem"
          gap="1rem"
        >
          <Box
            width="1.5rem"
            height="1.5rem"
          >
            <Info size="24" />
          </Box>
          <Text
            textStyle="body-base-strong"
            whiteSpace="pre-wrap"
          >
            {t(payment?.isCancelling ? 'cancellingPaymentInfoMessage' : 'cancelPaymentInfoMessage')}
          </Text>
        </Alert>
        {canBeCancelled && (
          <Button
            color="red-1"
            borderColor="red-1"
            _hover={{ color: 'red-0', borderColor: 'red-0' }}
            variant="secondary"
            leftIcon={<Trash />}
            onClick={confirmCancelPayment}
            ml="auto"
          >
            {t('cancelPayment')}
          </Button>
        )}
      </Show>
    </>
  );
}
