import {
  Box,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Show,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ArrowRight, CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { Field, useFormikContext } from 'formik';
import { ReactNode, useMemo, useState } from 'react';
import { Calendar } from 'react-calendar';
import { useTranslation } from 'react-i18next';
import '../../../assets/css/Calendar.css';
import { SEXY_BOX_SHADOW_T_T } from '../../../constants/common';
import { RoleFormValues } from '../../../types/roles';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import { DatePickerTrigger } from '../../Roles/DatePickerTrigger';
import DraggableDrawer from '../containers/DraggableDrawer';
import Divider from './Divider';

type DateOrNull = Date | null;
type OnDateChangeValue = DateOrNull | [DateOrNull, DateOrNull];

function DateDisplayBox({ date }: { date: DateOrNull }) {
  const { t } = useTranslation('common');
  return (
    <Flex
      gap="0.5rem"
      p="0.5rem 1rem"
      width={{ base: '100%', md: '11.125rem' }}
      bg="neutral-1"
      borderWidth="1px"
      borderRadius="0.5rem"
      borderColor="neutral-3"
    >
      <Icon
        as={CalendarBlank}
        boxSize="24px"
        color="neutral-5"
      />
      <Box color="neutral-7">{(date && format(date, DEFAULT_DATE_FORMAT)) ?? t('select')}</Box>
    </Flex>
  );
}

function SelectedDateDisplay({
  selectedDate,
  selectedRange,
  isRange,
}: {
  selectedDate: DateOrNull;
  selectedRange: [DateOrNull, DateOrNull];
  isRange?: boolean;
}) {
  return !isRange ? (
    <Box ml="1rem">
      <DateDisplayBox date={selectedDate} />{' '}
    </Box>
  ) : (
    <Flex
      gap="0.5rem"
      alignItems="center"
      mx="1rem"
    >
      <DateDisplayBox date={selectedRange[0] as Date} />
      <Icon
        as={ArrowRight}
        boxSize="1.5rem"
        color="lilac-0"
      />
      <DateDisplayBox date={selectedRange[1] as Date} />
    </Flex>
  );
}

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

function DecentDatePickerContainer({
  children,
  type,
  formIndex,
  disabled,
}: {
  children: ReactNode[];
  type: 'startDate' | 'endDate' | 'cliffDate';
  formIndex: number;
  disabled: boolean;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { values } = useFormikContext<RoleFormValues>();
  const selectedDate = values.roleEditing?.payments?.[formIndex]?.[type];
  const boxShadow = useBreakpointValue({ base: 'none', md: SEXY_BOX_SHADOW_T_T });
  const maxBoxW = useBreakpointValue({ base: '100%', md: '26.875rem' });
  return (
    <Field name={`roleEditing.payments.${formIndex}.${type}`}>
      {() => (
        <>
          <Show below="md">
            <Button
              onClick={() => setIsDrawerOpen(true)}
              variant="unstyled"
              p="0"
              flex={1}
              w="full"
              isDisabled={disabled}
              cursor={disabled ? 'not-allowed' : 'pointer'}
            >
              <DatePickerTrigger
                selectedDate={selectedDate}
                disabled={disabled}
              />
            </Button>

            <DraggableDrawer
              isOpen={isDrawerOpen}
              headerContent={undefined}
              onOpen={() => {}}
              onClose={() => setIsDrawerOpen(false)}
            >
              <Flex
                flexDir="column"
                justifySelf="center"
                borderRadius="0.75rem"
                boxShadow={boxShadow}
                maxW={maxBoxW}
                pt="1.5rem"
              >
                {children}
              </Flex>
            </DraggableDrawer>
          </Show>
          <Show above="md">
            <Menu
              placement="top-start"
              closeOnSelect={false}
            >
              <MenuButton
                as={Button}
                variant="unstyled"
                p="0"
                w="full"
                isDisabled={disabled}
                cursor={disabled ? 'not-allowed' : 'pointer'}
              >
                <DatePickerTrigger
                  selectedDate={selectedDate}
                  disabled={disabled}
                />
              </MenuButton>
              <MenuList zIndex={2}>
                <Flex
                  flexDir="column"
                  justifySelf="center"
                  borderRadius="0.75rem"
                  boxShadow={boxShadow}
                  maxW={maxBoxW}
                  bg="neutral-2"
                  pt="1.5rem"
                >
                  {children}
                </Flex>
              </MenuList>
            </Menu>
          </Show>
        </>
      )}
    </Field>
  );
}

function TodayBox({ isTodaySelected }: { isTodaySelected: () => boolean }) {
  // @dev @todo - This is a workaround to fix an issue with the dot not being centered on the current day. Gotta be a better way to fix this.
  const todayDotLeftMargin = useBreakpointValue({ base: '4.5vw', md: '1.15rem' });
  return (
    <Box
      ml={todayDotLeftMargin}
      bg={isTodaySelected() ? 'cosmic-nebula-0' : 'white-1'}
      borderRadius="50%"
      w="4px"
      h="4px"
    />
  );
}

export function DecentDatePicker({
  onChange,
  type,
  formIndex,
  minDate,
  maxDate,
  disabled,
}: {
  onChange: (date: Date) => void;
  type: 'startDate' | 'endDate' | 'cliffDate';
  minDate?: Date;
  maxDate?: Date;
  formIndex: number;
  disabled: boolean;
}) {
  const { values } = useFormikContext<RoleFormValues>();

  const selectedDate = useMemo(() => {
    if (values.roleEditing?.roleEditingPaymentIndex === undefined) return null;
    const paymentIndex = values.roleEditing.roleEditingPaymentIndex;
    return values.roleEditing?.payments?.[paymentIndex ?? 0]?.startDate ?? null;
  }, [values.roleEditing?.payments, values.roleEditing?.roleEditingPaymentIndex]);

  const isTodaySelected = () => {
    return !!selectedDate ? isToday(selectedDate) : false;
  };

  return (
    <DecentDatePickerContainer
      type={type}
      formIndex={formIndex}
      disabled={disabled}
    >
      <SelectedDateDisplay
        selectedDate={selectedDate}
        selectedRange={[null, null]}
        isRange={false}
      />
      <Divider my="1.5rem" />
      {!disabled && (
        <Calendar
          minDate={minDate}
          maxDate={maxDate}
          formatShortWeekday={(_, date) => date.toString().slice(0, 2)}
          prevLabel={<Icon as={CaretLeft} />}
          nextLabel={<Icon as={CaretRight} />}
          next2Label={null}
          prev2Label={null}
          tileContent={({ date }) =>
            isToday(date) ? <TodayBox isTodaySelected={isTodaySelected} /> : null
          }
          onChange={(e: OnDateChangeValue) => {
            if (e instanceof Date) {
              onChange?.(e);
            }
          }}
        />
      )}
    </DecentDatePickerContainer>
  );
}

export function DecentDatePickerRange({
  onChange,
  type,
  formIndex,
  disabled,
}: {
  onChange: (dateRange: [Date, Date]) => void;
  type: 'startDate' | 'endDate' | 'cliffDate';
  formIndex: number;
  disabled: boolean;
}) {
  const { values } = useFormikContext<RoleFormValues>();
  const selectedRange: [DateOrNull, DateOrNull] = useMemo(() => {
    if (values.roleEditing?.roleEditingPaymentIndex === undefined) return [null, null];
    const paymentIndex = values.roleEditing.roleEditingPaymentIndex;
    return [
      values.roleEditing?.payments?.[paymentIndex]?.startDate ?? null,
      values.roleEditing?.payments?.[paymentIndex]?.endDate ?? null,
    ];
  }, [values.roleEditing?.payments, values.roleEditing?.roleEditingPaymentIndex]);

  const isTodaySelected = () => {
    const paymentIndex = values.roleEditing?.roleEditingPaymentIndex;
    const startDate = values.roleEditing?.payments?.[paymentIndex ?? 0]?.startDate;
    const endDate = values.roleEditing?.payments?.[paymentIndex ?? 0]?.endDate;
    return (!!startDate && isToday(startDate)) || (!!endDate && isToday(endDate));
  };
  return (
    <DecentDatePickerContainer
      type={type}
      formIndex={formIndex}
      disabled={disabled}
    >
      <SelectedDateDisplay
        selectedDate={null}
        selectedRange={selectedRange}
        isRange={true}
      />
      <Divider my="1.5rem" />
      {!disabled && (
        <Calendar
          formatShortWeekday={(_, date) => date.toString().slice(0, 2)}
          prevLabel={<Icon as={CaretLeft} />}
          nextLabel={<Icon as={CaretRight} />}
          next2Label={null}
          prev2Label={null}
          tileContent={({ date }) =>
            isToday(date) ? <TodayBox isTodaySelected={isTodaySelected} /> : null
          }
          onChange={(e: OnDateChangeValue) => {
            if (Array.isArray(e) && e.length === 2 && e.every(d => d instanceof Date)) {
              const dateRange = e as [Date, Date];
              onChange?.(dateRange);
            }
          }}
          selectRange
        />
      )}
    </DecentDatePickerContainer>
  );
}
