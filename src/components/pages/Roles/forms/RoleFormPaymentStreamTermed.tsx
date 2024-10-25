import {
  Box,
  Button,
  Flex,
  FormControl,
  Hide,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { Calendar, CaretDown, CheckCircle } from '@phosphor-icons/react';
import { addDays, addMinutes, format } from 'date-fns';
import { Field, FieldProps, FormikErrors, useFormikContext } from 'formik';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW, DETAILS_BOX_SHADOW, isDevMode } from '../../../../constants/common';
import { BigIntValuePair } from '../../../../types';
import { DEFAULT_DATE_FORMAT } from '../../../../utils';
import DraggableDrawer from '../../../ui/containers/DraggableDrawer';
import { DatePicker } from '../../../ui/forms/DatePicker';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import Divider from '../../../ui/utils/Divider';
import { RoleFormValues, RoleHatFormValue } from '../types';
import { AssetSelector } from './RoleFormAssetSelector';
import { SectionTitle } from './RoleFormSectionTitle';

function ShadowedBox({
  hasBorderRadius = true,
  children,
}: {
  hasBorderRadius?: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      px={{ base: '1rem', md: 0 }}
      py="1rem"
      boxShadow={{
        base: CARD_SHADOW,
        md: 'unset',
      }}
      borderRadius={hasBorderRadius ? '0.5rem' : undefined}
    >
      {children}
    </Box>
  );
}

function CliffDatePicker({ formIndex, disabled }: { formIndex: number; disabled: boolean }) {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();

  const selectedStartDate = values?.roleEditing?.payments?.[formIndex]?.startDate;
  const selectedEndDate = values?.roleEditing?.payments?.[formIndex]?.endDate;

  return (
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
      <Field name={`roleEditing.payments.[${formIndex}].cliffDate"`}>
        {({ field }: FieldProps<Date, RoleFormValues>) => (
          <LabelWrapper
            label={t('date')}
            labelColor="neutral-7"
          >
            <DatePicker
              onChange={(date: Date) => setFieldValue(field.name, date)}
              selectedDate={field.value}
              minDate={selectedStartDate ? addDays(selectedStartDate, 1) : undefined}
              maxDate={selectedEndDate ? addDays(selectedEndDate, -1) : undefined}
              disabled={disabled}
            />
          </LabelWrapper>
        )}
      </Field>
    </FormControl>
  );
}

function TermSelection({
  selectedTermNumber,
  selectedTermEndDate,
  defaultDateColor = 'white-0',
}: {
  selectedTermNumber: number;
  selectedTermEndDate: Date;
  defaultDateColor?: string;
}) {
  const { t } = useTranslation(['roles']);

  return (
    <Flex
      alignItems="center"
      w="full"
      justifyContent="space-between"
    >
      <Text
        textStyle="input-text"
        color="white-0"
      >
        {t('termNumber', { number: selectedTermNumber })}
      </Text>
      <Flex
        alignItems="center"
        gap={2}
      >
        <Icon as={Calendar} />
        <Text
          textStyle="label-small"
          color={defaultDateColor}
        >
          {format(selectedTermEndDate, DEFAULT_DATE_FORMAT)}
        </Text>
      </Flex>
    </Flex>
  );
}

function TermSelectorMenu({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue, validateField } = useFormikContext<RoleFormValues>();
  console.log('🚀 ~ errors:', errors);
  const [selectedTerm, setSelectedTerm] = useState<{
    termNumber: number;
    termEndDate: Date;
  } | null>(null);
  const roleFormTerms = useMemo(
    () => values.roleEditing?.roleTerms || [],
    [values.roleEditing?.roleTerms],
  );

  const eligibleTerms = useMemo(
    () =>
      roleFormTerms
        .filter(term => !term.termEndDate || term.termEndDate >= new Date())
        .map(term => {
          if (!term.termEndDate) {
            throw new Error('Term end date is required');
          }
          return {
            termNumber: term.termNumber,
            termEndDate: term.termEndDate,
          };
        }),
    [roleFormTerms],
  );

  useEffect(() => {
    // @note {assumption} this also captures the current term being created
    const [currentTerm] = roleFormTerms.filter(
      term => !!term.termEndDate && term.termEndDate >= new Date(),
    );
    if (!selectedTerm && currentTerm) {
      if (!currentTerm.termEndDate) {
        throw new Error('Term end date is required');
      }
      setSelectedTerm({
        termNumber: currentTerm.termNumber,
        termEndDate: currentTerm.termEndDate,
      });
    }
  }, [selectedTerm, roleFormTerms]);

  useEffect(() => {
    if (selectedTerm) {
      // @todo: What is the start date for 'next' term payments?
      // @note {assumption} the start date is now for current terms or current term being proposed.
      setFieldValue(`roleEditing.payments[${formIndex}].startDate`, new Date());
      setFieldValue(`roleEditing.payments[${formIndex}].endDate`, selectedTerm.termEndDate);
      validateField(`roleEditing.payments`);
    }
  }, [selectedTerm, formIndex, setFieldValue, validateField]);
  return (
    <Box my="1rem">
      <Menu
        placement="bottom-end"
        offset={[0, 1]}
        matchWidth
      >
        {({ isOpen, onClose }) => (
          <>
            <MenuButton
              w="full"
              p={4}
              borderRadius="0.5rem"
              boxShadow={DETAILS_BOX_SHADOW}
              _hover={{ bg: 'neutral-3' }}
              _active={{ bg: 'neutral-2' }}
              transition="all ease-out 300ms"
            >
              {!!selectedTerm && (
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <TermSelection
                    selectedTermNumber={selectedTerm.termNumber}
                    selectedTermEndDate={selectedTerm.termEndDate}
                  />
                  <Icon
                    as={CaretDown}
                    boxSize="1.5rem"
                    color="white-0"
                  />
                </Flex>
              )}
            </MenuButton>
            <Hide above="lg">
              <DraggableDrawer
                isOpen={isOpen}
                onClose={onClose}
                onOpen={() => {}}
                headerContent={null}
                initialHeight="50%"
                closeOnOverlayClick={false}
              >
                {eligibleTerms.map((term, index) => (
                  <MenuItem
                    key={index}
                    display="inline-block"
                    onClick={() => {
                      setSelectedTerm(term);
                      onClose();
                    }}
                  >
                    <Box mb="0.5rem">
                      <Text
                        mb="1.5rem"
                        px={8}
                        textStyle="display-lg"
                        color="white-0"
                      >
                        {t('selectTerm')}
                      </Text>
                      <Divider variant="darker" />
                    </Box>
                    <Box
                      py={8}
                      px={6}
                      mx={2}
                      borderRadius="0.5rem"
                      _hover={{ bg: 'neutral-3' }}
                      _active={{ bg: 'neutral-2' }}
                      transition="all ease-out 100ms"
                    >
                      <Flex
                        alignItems="center"
                        gap={4}
                      >
                        <TermSelection
                          selectedTermNumber={term.termNumber}
                          selectedTermEndDate={term.termEndDate}
                          defaultDateColor="neutral-7"
                        />
                        <Icon
                          as={CheckCircle}
                          boxSize="1.5rem"
                          color="lilac-0"
                        />
                      </Flex>
                    </Box>
                  </MenuItem>
                ))}
              </DraggableDrawer>
            </Hide>
            <Hide below="lg">
              <MenuList
                borderBottomRadius="0.5rem"
                boxShadow={DETAILS_BOX_SHADOW}
                _hover={{ bg: 'neutral-3' }}
                _active={{ bg: 'neutral-2' }}
                transition="all ease-out 300ms"
              >
                {eligibleTerms.map((term, index) => (
                  <MenuItem
                    key={index}
                    p="1rem"
                    onClick={() => {
                      setSelectedTerm(term);
                      onClose();
                    }}
                  >
                    <TermSelection
                      selectedTermNumber={term.termNumber}
                      selectedTermEndDate={term.termEndDate}
                      defaultDateColor="neutral-7"
                    />
                  </MenuItem>
                ))}
              </MenuList>
            </Hide>
          </>
        )}
      </Menu>
    </Box>
  );
}

export default function RoleFormPaymentStreamTermed({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();
  const roleEditingPaymentsErrors = (errors.roleEditing as FormikErrors<RoleHatFormValue>)
    ?.payments;
  const payment = useMemo(
    () => values.roleEditing?.payments?.[formIndex],
    [formIndex, values.roleEditing?.payments],
  );
  const streamId = values.roleEditing?.payments?.[formIndex]?.streamId;

  return (
    <>
      <Box
        bg="neutral-2"
        borderRadius="0.5rem"
      >
        <ShadowedBox>
          <SectionTitle
            title={t('asset')}
            tooltipContent={t('addPaymentStreamSubTitle')}
            externalLink="https://docs.decentdao.org/app/user-guide/roles-and-streaming/streaming-payroll-and-vesting"
          />
          <AssetSelector
            formIndex={formIndex}
            disabled={!!streamId}
          />
        </ShadowedBox>
        <ShadowedBox hasBorderRadius={false}>
          <SectionTitle
            title={t('assignPayment')}
            tooltipContent={t('assignPaymentTooltip')}
          />
          <TermSelectorMenu formIndex={formIndex} />
        </ShadowedBox>
        <ShadowedBox>
          <CliffDatePicker
            formIndex={formIndex}
            disabled={!!streamId}
          />
        </ShadowedBox>
      </Box>
      <Flex
        justifyContent="flex-end"
        mt={8}
      >
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
              const nowDate = new Date();
              setFieldValue(`roleEditing.payments[${formIndex}]`, {
                ...payment,
                amount: {
                  value: '100',
                  bigintValue: 100000000000000000000n,
                } as BigIntValuePair,
                decimals: 18,
                startDate: addMinutes(nowDate, 1),
                endDate: addMinutes(nowDate, 10),
              });
            }}
          >
            Ze stream ends in 10!
          </Button>
        )}
      </Flex>
    </>
  );
}
