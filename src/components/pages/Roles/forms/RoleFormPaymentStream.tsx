import {
  Box,
  Button,
  Flex,
  FormControl,
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
import { ArrowRight, Minus, Plus } from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW } from '../../../../constants/common';
import DraggableDrawer from '../../../ui/containers/DraggableDrawer';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { DecentDatePicker } from '../../../ui/utils/DecentDatePicker';
import { DatePickerTrigger } from '../DatePickerTrigger';
import { RoleFormValues } from '../types';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function DurationTicker({
  fieldName,
  fieldType,
}: {
  fieldType: 'vestingDuration' | 'cliffDuration';
  fieldName: 'years' | 'days' | 'hours';
}) {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl>
      <Field name={`roleEditing.payment.scheduleDuration.[${fieldType}].[${fieldName}]`}>
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

function ScheduleDuration() {
  return (
    <Flex
      flexDir="column"
      gap="0.5rem"
    >
      <DurationTicker
        fieldName="years"
        fieldType="vestingDuration"
      />
      <DurationTicker
        fieldName="days"
        fieldType="vestingDuration"
      />
      <DurationTicker
        fieldName="hours"
        fieldType="vestingDuration"
      />
    </Flex>
  );
}

function CliffDuration() {
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
        />
        <DurationTicker
          fieldName="days"
          fieldType="cliffDuration"
        />
        <DurationTicker
          fieldName="hours"
          fieldType="cliffDuration"
        />
      </Box>
    </Flex>
  );
}

function PaymentDatePicker({ type }: { type: 'startDate' | 'endDate' }) {
  const { setFieldValue, values } = useFormikContext<RoleFormValues>();
  const selectedDate =
    type === 'startDate'
      ? values.roleEditing?.payments?.[0].scheduleFixedDate?.startDate
      : values.roleEditing?.payments?.[0].scheduleFixedDate?.endDate;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Field name={`roleEditing.payment.scheduleFixedDate.${type}`}>
      {({ field }: FieldProps<string, RoleFormValues>) => (
        <>
          <Show below="md">
            <Button
              onClick={() => setIsDrawerOpen(true)}
              variant="unstyled"
              p="0"
              flex={1}
            >
              <DatePickerTrigger selectedDate={selectedDate} />
            </Button>

            <DraggableDrawer
              isOpen={isDrawerOpen}
              headerContent={undefined}
              onOpen={() => {}}
              onClose={() => setIsDrawerOpen(false)}
            >
              <DecentDatePicker onChange={date => setFieldValue(field.name, date)} />
            </DraggableDrawer>
          </Show>

          <Show above="md">
            <Menu placement="top">
              <>
                <MenuButton
                  as={Button}
                  variant="unstyled"
                  p="0"
                  w="full"
                >
                  <DatePickerTrigger selectedDate={selectedDate} />
                </MenuButton>
                <MenuList>
                  <DecentDatePicker onChange={date => setFieldValue(field.name, date)} />
                </MenuList>
              </>
            </Menu>
          </Show>
        </>
      )}
    </Field>
  );
}

function FixedDate() {
  const { t } = useTranslation(['roles']);

  return (
    <Box>
      <Text textStyle="label-base"> {t('fixedDates')} </Text>
      <FormControl my="1rem">
        <Flex
          gap={{ base: '0', md: '0.5rem' }}
          alignItems="center"
          justifyContent="space-between"
          wrap={{ base: 'wrap', md: 'nowrap' }}
        >
          <PaymentDatePicker type="startDate" />
          <Icon
            as={ArrowRight}
            boxSize="1.5rem"
            color="lilac-0"
          />
          <PaymentDatePicker type="endDate" />
        </Flex>
      </FormControl>
    </Box>
  );
}

function DurationTabs() {
  const { t } = useTranslation(['roles']);
  const { setFieldValue } = useFormikContext<RoleFormValues>();

  return (
    <Tabs
      variant={'twoTone'}
      my="1rem"
    >
      <TabList my="1rem">
        <Tab onClick={() => setFieldValue('roleEditing.payment.scheduleType', 'duration')}>
          {t('duration')}
        </Tab>
        <Tab onClick={() => setFieldValue('roleEditing.payment.scheduleType', 'fixedDate')}>
          {t('fixedDates')}
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Flex
            flexDir="column"
            gap="1rem"
          >
            <ScheduleDuration />
            <CliffDuration />
          </Flex>
        </TabPanel>

        <TabPanel>
          <FixedDate />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default function RoleFormPaymentStream() {
  const { t } = useTranslation(['roles']);
  return (
    <Box
      px={{ base: '1rem', md: 0 }}
      py="1rem"
      bg="neutral-2"
      boxShadow={{
        base: CARD_SHADOW,
        md: 'unset',
      }}
      borderRadius="0.5rem"
    >
      <SectionTitle
        title={t('addPaymentStream')}
        subTitle={t('addPaymentStreamSubTitle')}
        // @todo Add Learn More link
        externalLink="#"
      />
      <AssetSelector />
      <SectionTitle
        title={t('schedule')}
        subTitle={t('scheduleSubTitle')}
      />
      <DurationTabs />
    </Box>
  );
}
