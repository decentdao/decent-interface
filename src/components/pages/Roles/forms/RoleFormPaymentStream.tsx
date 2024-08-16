import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  NumberInput,
  NumberInputField,
  Show,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { ArrowLeft, ArrowRight, Minus, Plus } from '@phosphor-icons/react';
import { Field, FieldProps, FormikErrors, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { CARD_SHADOW } from '../../../../constants/common';
import { useRolesStore } from '../../../../store/roles';
import DraggableDrawer from '../../../ui/containers/DraggableDrawer';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { DecentDatePicker } from '../../../ui/utils/DecentDatePicker';
import { DatePickerTrigger } from '../DatePickerTrigger';
import { RoleFormValues, RoleValue } from '../types';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function DurationTicker({
  fieldName,
  fieldType,
  formIndex,
}: {
  fieldType: 'duration' | 'cliffDuration';
  fieldName: 'years' | 'days' | 'hours';
  formIndex: number;
}) {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl>
      <Field
        name={`roleEditing.payments[${formIndex}].scheduleDuration.[${fieldType}].[${fieldName}]`}
      >
        {({ field, form: { setFieldValue }, meta }: FieldProps<string, RoleFormValues>) => {
          return (
            <LabelWrapper
              label={t(fieldName)}
              errorMessage={meta.error && meta.touched ? meta.error : undefined}
            >
              <Flex gap="0.25rem">
                <IconButton
                  aria-label="stepper-minus"
                  minW="40px"
                  h="40px"
                  variant="stepper"
                  icon={
                    <Icon
                      as={Minus}
                      boxSize="1rem"
                    />
                  }
                  onClick={() => {
                    if (field.value === undefined || Number(field.value) <= 0) return;
                    setFieldValue(field.name, Number(field.value) - 1);
                  }}
                />
                <NumberInput
                  w="full"
                  value={field.value}
                  onChange={(value: string) => setFieldValue(field.name, Number(value))}
                >
                  <NumberInputField />
                </NumberInput>
                <IconButton
                  aria-label="stepper-plus"
                  minW="40px"
                  h="40px"
                  variant="stepper"
                  icon={
                    <Icon
                      as={Plus}
                      boxSize="1rem"
                    />
                  }
                  onClick={() => {
                    if (field.value === undefined) {
                      setFieldValue(field.name, 1);
                      return;
                    }
                    setFieldValue(field.name, Number(field.value) + 1);
                  }}
                />
              </Flex>
            </LabelWrapper>
          );
        }}
      </Field>
    </FormControl>
  );
}

function ScheduleDuration({ formIndex }: { formIndex: number }) {
  return (
    <Flex
      flexDir="column"
      gap="0.5rem"
    >
      <DurationTicker
        fieldName="years"
        fieldType="duration"
        formIndex={formIndex}
      />
      <DurationTicker
        fieldName="days"
        fieldType="duration"
        formIndex={formIndex}
      />
      <DurationTicker
        fieldName="hours"
        fieldType="duration"
        formIndex={formIndex}
      />
    </Flex>
  );
}

function CliffDuration({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  return (
    <Flex
      flexDir="column"
      gap="0.5rem"
    >
      <SectionTitle
        title={t('cliff')}
        subTitle={t('cliffSubTitle')}
      />
      <Box mt="1rem">
        <DurationTicker
          fieldName="years"
          fieldType="cliffDuration"
          formIndex={formIndex}
        />
        <DurationTicker
          fieldName="days"
          fieldType="cliffDuration"
          formIndex={formIndex}
        />
        <DurationTicker
          fieldName="hours"
          fieldType="cliffDuration"
          formIndex={formIndex}
        />
      </Box>
    </Flex>
  );
}

function PaymentDatePicker({
  type,
  formIndex,
}: {
  type: 'startDate' | 'endDate' | 'cliffDate';
  formIndex: number;
}) {
  const { setFieldValue, values } = useFormikContext<RoleFormValues>();

  const selectedDate = values.roleEditing?.payments?.[formIndex].scheduleFixedDate?.[type];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isCliffDate = type === 'cliffDate';

  const onCliffDateChange = isCliffDate
    ? (date: Date) => {
        setFieldValue(`roleEditing.payments[${formIndex}].scheduleFixedDate.cliffDate`, date);
      }
    : undefined;

  const onDateRangeChange = !isCliffDate
    ? (dateRange: Date[]) => {
        setFieldValue(
          `roleEditing.payments[${formIndex}].scheduleFixedDate.startDate`,
          dateRange[0],
        );
        setFieldValue(`roleEditing.payments[${formIndex}].scheduleFixedDate.endDate`, dateRange[1]);
      }
    : undefined;

  return (
    <Field name={`roleEditing.payments[${formIndex}].scheduleFixedDate.${type}`}>
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
              <>
                <MenuButton
                  as={Button}
                  variant="unstyled"
                  p="0"
                  w="full"
                >
                  <DatePickerTrigger selectedDate={selectedDate} />
                </MenuButton>
                <MenuList zIndex={1}>
                  <DecentDatePicker
                    isRange={!isCliffDate}
                    onChange={onCliffDateChange}
                    onRangeChange={onDateRangeChange}
                  />
                </MenuList>
              </>
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
      <Text textStyle="label-base"> {t('fixedDates')} </Text>
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

function DurationTabs({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { setFieldValue } = useFormikContext<RoleFormValues>();

  return (
    <Tabs
      variant={'twoTone'}
      my="1rem"
    >
      <TabList my="1rem">
        <Tab
          onClick={() =>
            setFieldValue(`roleEditing.payments[${formIndex}].scheduleType`, 'duration')
          }
        >
          {t('duration')}
        </Tab>
        <Tab
          onClick={() =>
            setFieldValue(`roleEditing.payments[${formIndex}].scheduleType`, 'fixedDate')
          }
        >
          {t('fixedDates')}
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Flex
            flexDir="column"
            gap="1rem"
          >
            <ScheduleDuration formIndex={formIndex} />
            <CliffDuration formIndex={formIndex} />
          </Flex>
        </TabPanel>

        <TabPanel>
          <FixedDate formIndex={formIndex} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default function RoleFormPaymentStream({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();
  const { hatsTree, getPayment } = useRolesStore();
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
        onClick={() => {
          if (!values?.roleEditing?.payments || !hatsTree) return;

          let isExistingPayment: boolean = false;
          if (values?.roleEditing?.payments?.[formIndex].streamId) {
            const foundPayment = getPayment(
              values.roleEditing.id,
              getAddress(values.roleEditing.payments[formIndex].streamId),
            );
            if (foundPayment) {
              isExistingPayment = true;
            }
          }
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
      <DurationTabs formIndex={formIndex} />
      <Flex justifyContent="flex-end">
        <Button
          isDisabled={!!roleEditingPaymentsErrors || !values?.roleEditing?.payments || !hatsTree}
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
