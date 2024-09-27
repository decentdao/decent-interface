import { Box, Button, Flex, FormControl, Grid, GridItem, Icon } from '@chakra-ui/react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { addDays } from 'date-fns';
import { FormikErrors, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW } from '../../../../constants/common';
import { useRolesStore } from '../../../../store/roles';
import { DecentDatePicker } from '../../../ui/utils/DecentDatePicker';
import { RoleFormValues, RoleHatFormValue } from '../types';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function FixedDate({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();

  const onDateChange = (date: Date, type: 'startDate' | 'endDate') => {
    const payment = values?.roleEditing?.payments?.[formIndex];
    if (!payment) return;

    const startDate = type === 'startDate' ? date : payment.startDate;
    const endDate = type === 'endDate' ? date : payment.endDate;

    setFieldValue(`roleEditing.payments[${formIndex}]`, {
      ...payment,
      startDate,
      endDate,
    });
  };

  const setStartDate = values?.roleEditing?.payments?.[formIndex]?.startDate;
  const setEndDate = values?.roleEditing?.payments?.[formIndex]?.endDate;

  return (
    <Box>
      <FormControl my="1rem">
        <Grid
          gridTemplateAreas={{
            base: `"start arrow"
          "end blank"`,
            sm: `"start arrow end"`,
          }}
          gap="0.5rem"
          gridTemplateColumns={{
            base: '1fr max-content',
            sm: '1fr 1.5rem 1fr',
          }}
          alignItems="center"
        >
          <GridItem area="start">
            <DecentDatePicker
              type="startDate"
              maxDate={values?.roleEditing?.payments?.[formIndex]?.endDate}
              formIndex={formIndex}
              onChange={date => onDateChange(date, 'startDate')}
            />
          </GridItem>
          <GridItem
            area="arrow"
            display="flex"
            alignItems="center"
          >
            <Icon
              as={ArrowRight}
              boxSize="1.5rem"
              color="lilac-0"
            />
          </GridItem>
          <GridItem area="end">
            <DecentDatePicker
              type="endDate"
              minDate={values?.roleEditing?.payments?.[formIndex]?.startDate}
              formIndex={formIndex}
              onChange={date => onDateChange(date, 'endDate')}
            />
          </GridItem>
        </Grid>
      </FormControl>
      <FormControl
        my="1rem"
        display="flex"
        flexDir="column"
        gap="1rem"
      >
        <SectionTitle
          title={t('cliff')}
          subTitle={t('cliffSubTitle')}
        />
        <DecentDatePicker
          type="cliffDate"
          formIndex={formIndex}
          minDate={setStartDate ? addDays(setStartDate, 1) : undefined}
          maxDate={setEndDate ? addDays(setEndDate, -1) : undefined}
          onChange={(date: Date) => {
            setFieldValue(`roleEditing.payments[${formIndex}].cliffDate`, date);
          }}
        />
      </FormControl>
    </Box>
  );
}

export default function RoleFormPaymentStream({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();
  const { getPayment } = useRolesStore();
  const roleEditingPaymentsErrors = (errors.roleEditing as FormikErrors<RoleHatFormValue>)
    ?.payments;
  return (
    <Box
      px={{ base: '1rem', md: 0 }}
      pb="1rem"
      bg="neutral-2"
      boxShadow={{
        base: CARD_SHADOW,
        md: 'unset',
      }}
      mt="-3.5rem"
      borderRadius="0.5rem"
      position="relative"
    >
      <Button
        variant="tertiary"
        p="0"
        _hover={{
          bg: 'transparent',
        }}
        mb="1rem"
        leftIcon={<ArrowLeft size="1.5rem" />}
        isDisabled={!values?.roleEditing?.payments?.[formIndex]}
        onClick={() => {
          const hatId = values.roleEditing?.id;
          if (!values?.roleEditing?.payments?.[formIndex] || !hatId) return;
          const streamId = values.roleEditing?.payments?.[formIndex]?.streamId;
          const isExistingPayment = !!streamId ? getPayment(hatId, streamId) : undefined;
          // if payment is new, and unedited, remove it
          if (
            formIndex === values.roleEditing.payments.length - 1 &&
            !values.roleEditing.editedRole &&
            !isExistingPayment
          ) {
            setFieldValue(
              'roleEditing.payments',
              values.roleEditing.payments.filter((_, index) => index !== formIndex),
            );
          }
          setFieldValue('roleEditing.roleEditingPaymentIndex', undefined);
        }}
      >
        {t('addPayment')}
      </Button>
      <SectionTitle
        title={t('addPayment')}
        subTitle={t('addPaymentStreamSubTitle')}
        externalLink="https://docs.decentdao.org/app/user-guide/roles-and-streaming/streaming-payroll-and-vesting"
      />
      <AssetSelector formIndex={formIndex} />
      <SectionTitle
        title={t('schedule')}
        subTitle={t('scheduleSubTitle')}
        tooltipContent={t('cliffPaymentTooltip')}
      />
      <FixedDate formIndex={formIndex} />
      <Flex justifyContent="flex-end">
        <Button
          isDisabled={!!roleEditingPaymentsErrors}
          onClick={() => {
            setFieldValue('roleEditing.roleEditingPaymentIndex', undefined);
          }}
        >
          {t('save')}
        </Button>
      </Flex>
    </Box>
  );
}
