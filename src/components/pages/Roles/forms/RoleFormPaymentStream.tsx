import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  GridItem,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Show,
} from '@chakra-ui/react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { Field, FormikErrors, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { CARD_SHADOW } from '../../../../constants/common';
import { useRolesStore } from '../../../../store/roles';
import DraggableDrawer from '../../../ui/containers/DraggableDrawer';
import { DecentDatePicker } from '../../../ui/utils/DecentDatePicker';
import { DatePickerTrigger } from '../DatePickerTrigger';
import { RoleFormValues, RoleValue } from '../types';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function PaymentDatePicker({
  type,
  formIndex,
}: {
  type: 'startDate' | 'endDate' | 'cliffDate';
  formIndex: number;
}) {
  const { setFieldValue, values } = useFormikContext<RoleFormValues>();

  const selectedDate = values.roleEditing?.payments?.[formIndex][type];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isCliffDate = type === 'cliffDate';

  const onCliffDateChange = isCliffDate
    ? (date: Date) => {
        setFieldValue(`roleEditing.payments[${formIndex}].cliffDate`, date);
      }
    : undefined;

  const onDateRangeChange = !isCliffDate
    ? (dateRange: Date[]) => {
        setFieldValue(`roleEditing.payments[${formIndex}].startDate`, dateRange[0]);
        setFieldValue(`roleEditing.payments[${formIndex}].endDate`, dateRange[1]);
      }
    : undefined;

  return (
    <Field name={`roleEditing.payments[${formIndex}].${type}`}>
      {() => (
        <>
          <Show below="md">
            <Button
              onClick={() => setIsDrawerOpen(true)}
              variant="unstyled"
              p="0"
              flex={1}
              w="full"
            >
              <DatePickerTrigger selectedDate={selectedDate} />
            </Button>

            <DraggableDrawer
              isOpen={isDrawerOpen}
              headerContent={undefined}
              onOpen={() => {}}
              onClose={() => setIsDrawerOpen(false)}
            >
              <DecentDatePicker
                isRange={!isCliffDate}
                onChange={onCliffDateChange}
                onRangeChange={onDateRangeChange}
              />
            </DraggableDrawer>
          </Show>

          <Show above="md">
            <Menu placement="top-start">
              <MenuButton
                as={Button}
                variant="unstyled"
                p="0"
                w="full"
              >
                <DatePickerTrigger selectedDate={selectedDate} />
              </MenuButton>
              <MenuList zIndex={2}>
                <DecentDatePicker
                  isRange={!isCliffDate}
                  onChange={onCliffDateChange}
                  onRangeChange={onDateRangeChange}
                />
              </MenuList>
            </Menu>
          </Show>
        </>
      )}
    </Field>
  );
}

function FixedDate({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);

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
            <PaymentDatePicker
              type="startDate"
              formIndex={formIndex}
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
            <PaymentDatePicker
              type="endDate"
              formIndex={formIndex}
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
        <PaymentDatePicker
          type="cliffDate"
          formIndex={formIndex}
        />
      </FormControl>
    </Box>
  );
}

export default function RoleFormPaymentStream({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();
  const { getPayment } = useRolesStore();
  const roleEditingPaymentsErrors = (errors.roleEditing as FormikErrors<RoleValue>)?.payments;
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
          if (!values?.roleEditing?.payments?.[formIndex]) return;

          const isExistingPayment =
            values.roleEditing.payments[formIndex].streamId &&
            getPayment(
              values.roleEditing.id,
              getAddress(values.roleEditing.payments[formIndex].streamId ?? ''),
            );
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
        tooltipContent={t('addPaymentStreamTooltip')}
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
