import {
  Box,
  Button,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberInput,
  NumberInputField,
  Show,
} from '@chakra-ui/react';
import { CaretDown, CaretUp, Minus, Plus } from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW } from '../../../../constants/common';
import DraggableDrawer from '../../../ui/containers/DraggableDrawer';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { DecentDatePicker } from '../../../ui/utils/DecentDatePicker';
import { EaseOutComponent } from '../../../ui/utils/EaseOutComponent';
import { DatePickerTrigger } from '../DatePickerTrigger';
import { RoleFormValues, frequencyAmountLabel, frequencyOptions } from '../types';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function FrequencySelector() {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl my="1rem">
      <Field name="roleEditing.payroll.paymentFrequency">
        {({ field, form: { setFieldValue } }: FieldProps<string, RoleFormValues>) => {
          const inputValue = field.value ? t(frequencyOptions[field.value]) : 'Select';
          return (
            <LabelWrapper label={t('frequency')}>
              <Menu
                placement="bottom-end"
                offset={[0, 8]}
                size="100%"
                matchWidth
              >
                {({ isOpen }) => (
                  <>
                    <MenuButton
                      as={Button}
                      variant="unstyled"
                      p="0"
                      w="full"
                    >
                      <InputGroup>
                        <Input
                          bg="neutral-2"
                          boxShadow="0px 0px 0px 1px #100414, 0px 0px 0px 1px rgba(248, 244, 252, 0.04) inset, 0px 1px 0px 0px rgba(248, 244, 252, 0.04) inset"
                          value={inputValue}
                        />
                        <InputRightElement>
                          <Icon as={isOpen ? CaretUp : CaretDown} />
                        </InputRightElement>
                      </InputGroup>
                    </MenuButton>
                    <MenuList
                      zIndex={1}
                      bg="neutral-2"
                      py="0.5rem"
                      boxShadow={CARD_SHADOW}
                      borderRadius="0.5rem"
                      px="0.25rem"
                      w="100%"
                    >
                      <EaseOutComponent>
                        {Object.entries(frequencyOptions).map(([key, value]) => (
                          <MenuItem
                            key={key}
                            w="full"
                            p="1rem"
                            _hover={{ color: 'lilac--1', bg: 'white-alpha-04' }}
                            textStyle="input-text"
                            onClick={() => {
                              setFieldValue(field.name, key);
                            }}
                          >
                            {t(value)}
                          </MenuItem>
                        ))}
                      </EaseOutComponent>
                    </MenuList>
                  </>
                )}
              </Menu>
            </LabelWrapper>
          );
        }}
      </Field>
    </FormControl>
  );
}

function PaymentStartDatePicker() {
  const { setFieldValue, values } = useFormikContext<RoleFormValues>();
  const selectedDate = values.roleEditing?.payroll?.paymentStartDate;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <FormControl my="1rem">
      <Field name="roleEditing.payroll.paymentStartDate">
        {({ field }: FieldProps<string, RoleFormValues>) => (
          <>
            <Show below="md">
              <Button
                onClick={() => setIsDrawerOpen(true)}
                variant="unstyled"
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
    </FormControl>
  );
}

function PaymentFrequency() {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl my="1rem">
      <Field name="roleEditing.payroll.paymentFrequencyNumber">
        {({ field, form: { setFieldValue, values }, meta }: FieldProps<string, RoleFormValues>) => {
          const paymentFrequency = values.roleEditing?.payroll?.paymentFrequency;
          const frequencyLabel = !!paymentFrequency
            ? t(frequencyAmountLabel[paymentFrequency])
            : '';

          return (
            <LabelWrapper
              label={frequencyLabel}
              tooltipContent={<Box></Box>}
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
                  value={values.roleEditing?.payroll?.paymentFrequencyNumber}
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

export default function RoleFormPayroll() {
  const { t } = useTranslation(['roles']);
  const { values } = useFormikContext<RoleFormValues>();
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
        title={t('asset')}
        subTitle={t('assetSubtitle')}
        // @todo Add Learn More link
        externalLink="#"
      />
      <AssetSelector formName="vesting" />
      <SectionTitle
        title={t('paymentFrequency')}
        subTitle={t('paymentFrequencySubtitle')}
        // @todo Add Learn More link
        externalLink="#"
      />
      <FrequencySelector />
      {values.roleEditing?.payroll?.paymentFrequency && (
        <>
          <PaymentStartDatePicker />
          <PaymentFrequency />
        </>
      )}
    </Box>
  );
}
