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

function VestingDurationTicker({
  fieldName,
  fieldType,
}: {
  fieldType: 'vestingDuration' | 'cliffDuration';
  fieldName: 'years' | 'days' | 'hours';
}) {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl>
      <Field name={`roleEditing.vesting.scheduleDuration.[${fieldType}].[${fieldName}]`}>
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

function VestingScheduleDuration() {
  return (
    <Flex
      flexDir="column"
      gap="0.5rem"
    >
      <VestingDurationTicker
        fieldName="years"
        fieldType="vestingDuration"
      />
      <VestingDurationTicker
        fieldName="days"
        fieldType="vestingDuration"
      />
      <VestingDurationTicker
        fieldName="hours"
        fieldType="vestingDuration"
      />
    </Flex>
  );
}

function VestingCliffDuration() {
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
        <VestingDurationTicker
          fieldName="years"
          fieldType="cliffDuration"
        />
        <VestingDurationTicker
          fieldName="days"
          fieldType="cliffDuration"
        />
        <VestingDurationTicker
          fieldName="hours"
          fieldType="cliffDuration"
        />
      </Box>
    </Flex>
  );
}

function VestingDatePicker({ type }: { type: 'startDate' | 'endDate' }) {
  const { setFieldValue, values } = useFormikContext<RoleFormValues>();
  const selectedDate =
    type === 'startDate'
      ? values.roleEditing?.vesting?.scheduleFixedDate?.startDate
      : values.roleEditing?.vesting?.scheduleFixedDate?.endDate;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Field name={`roleEditing.vesting.scheduleFixedDate.${type}`}>
      {() => (
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
              <DecentDatePicker
                isRange
                onRangeChange={dateRange => {
                  setFieldValue('roleEditing.vesting.scheduleFixedDate.startDate', dateRange[0]);
                  setFieldValue('roleEditing.vesting.scheduleFixedDate.endDate', dateRange[1]);
                }}
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
                <MenuList>
                  <DecentDatePicker
                    isRange
                    onRangeChange={dateRange => {
                      setFieldValue(
                        'roleEditing.vesting.scheduleFixedDate.startDate',
                        dateRange[0],
                      );
                      setFieldValue('roleEditing.vesting.scheduleFixedDate.endDate', dateRange[1]);
                    }}
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

function VestingFixedDate() {
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
          <VestingDatePicker type="startDate" />
          <Icon
            as={ArrowRight}
            boxSize="1.5rem"
            color="lilac-0"
          />
          <VestingDatePicker type="endDate" />
        </Flex>
      </FormControl>
    </Box>
  );
}

function VestingTabs() {
  const { t } = useTranslation(['roles']);
  const { setFieldValue } = useFormikContext<RoleFormValues>();

  return (
    <Tabs
      variant={'twoTone'}
      my="1rem"
    >
      <TabList my="1rem">
        <Tab onClick={() => setFieldValue('roleEditing.vesting.scheduleType', 'duration')}>
          {t('duration')}
        </Tab>
        <Tab onClick={() => setFieldValue('roleEditing.vesting.scheduleType', 'fixedDate')}>
          {t('fixedDates')}
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Flex
            flexDir="column"
            gap="1rem"
          >
            <VestingScheduleDuration />
            <VestingCliffDuration />
          </Flex>
        </TabPanel>

        <TabPanel>
          <VestingFixedDate />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default function RoleFormVesting() {
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
        title={t('addVesting')}
        subTitle={t('addVestingSubTitle')}
        // @todo Add Learn More link
        externalLink="#"
      />
      <AssetSelector formName="vesting" />
      <SectionTitle
        title={t('vestingSchedule')}
        subTitle={t('vestingScheduleSubTitle')}
      />
      <VestingTabs />
    </Box>
  );
}
