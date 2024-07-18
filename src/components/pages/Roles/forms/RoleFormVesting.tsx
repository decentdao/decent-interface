import {
  Box,
  Flex,
  FormControl,
  Icon,
  IconButton,
  NumberInput,
  NumberInputField,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { Minus, Plus } from '@phosphor-icons/react';
import { Field, FieldProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW } from '../../../../constants/common';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { RoleFormValues } from '../types';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function VestingDurationStepperInput({
  fieldName,
  fieldType,
}: {
  fieldType: 'vestingDuration' | 'cliffDuration';
  fieldName: 'years' | 'days' | 'hours';
}) {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl>
      <Field name={`roleEditing.vesting.vestingSchedule.[${fieldType}].[${fieldName}]`}>
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
                    if (field.value === undefined || Number(field.value) <= 1) return;
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
      <VestingDurationStepperInput
        fieldName="years"
        fieldType="vestingDuration"
      />
      <VestingDurationStepperInput
        fieldName="days"
        fieldType="vestingDuration"
      />
      <VestingDurationStepperInput
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
        <VestingDurationStepperInput
          fieldName="years"
          fieldType="cliffDuration"
        />
        <VestingDurationStepperInput
          fieldName="days"
          fieldType="cliffDuration"
        />
        <VestingDurationStepperInput
          fieldName="hours"
          fieldType="cliffDuration"
        />
      </Box>
    </Flex>
  );
}

function VestingFixedDate() {
  return (
    <Box>
      <Box></Box>
    </Box>
  );
}

function VestingTabs() {
  const { t } = useTranslation(['roles']);
  return (
    <Tabs
      variant={'twoTone'}
      my="1rem"
    >
      <TabList my="1rem">
        <Tab>{t('duration')}</Tab>
        <Tab>{t('fixedDates')}</Tab>
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
