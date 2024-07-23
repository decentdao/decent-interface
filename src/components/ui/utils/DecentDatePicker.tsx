import { Box, Flex, Icon, useBreakpointValue } from '@chakra-ui/react';
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Calendar } from 'react-calendar';
import { SEXY_BOX_SHADOW_T_T } from '../../../constants/common';

import '../../../assets/css/Calendar.css';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import Divider from './Divider';

interface DecentDatePickerProps {
  minDate?: Date;
  onChange?: (date: Date) => void;
  onRangeChange?: (date: [Date, Date]) => void;
  isRange?: boolean;
}

type DateOrNull = Date | null;
type OnDateChangeValue = DateOrNull | [DateOrNull, DateOrNull];

function SelectedDateDisplay({
  selectedDate,
}: {
  selectedDate: DateOrNull;
  selectedRange?: [DateOrNull, DateOrNull];
}) {
  return (
    <Flex
      gap="0.5rem"
      ml="1rem"
      p="0.5rem 1rem"
      width="11.125rem"
      bg="neutral-1"
      borderWidth="1px"
      borderRadius="0.25rem"
      borderColor="neutral-3"
    >
      <Icon
        as={CalendarBlank}
        boxSize="24px"
        color="neutral-5"
      />
      <Box color="neutral-7">
        {(selectedDate && format(selectedDate, DEFAULT_DATE_FORMAT)) ?? 'Select'}
      </Box>
    </Flex>
  );
}

const isToday = (someDate: Date) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

export function DecentDatePicker({
  minDate,
  onChange,
  isRange,
  onRangeChange,
}: DecentDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<DateOrNull>(null);
  const [selectedRange, setSelectedRange] = useState<[DateOrNull, DateOrNull]>([null, null]);

  const boxShadow = useBreakpointValue({ base: 'none', md: SEXY_BOX_SHADOW_T_T });
  const maxBoxW = useBreakpointValue({ base: '100%', md: '26.875rem' });

  // @dev @todo - This is a workaround to fix an issue with the dot not being centered on the current day. Gotta be a better way to fix this.
  const todayDotLeftMargin = useBreakpointValue({ base: '5vw', md: '1.35rem' });

  return (
    <Flex
      // display="flex"
      flexDir="column"
      justifySelf="center"
      borderRadius="0.5rem"
      boxShadow={boxShadow}
      maxW={maxBoxW}
      bg="neutral-2"
      pt="1.5rem"
    >
      <SelectedDateDisplay
        selectedDate={selectedDate}
        selectedRange={selectedRange}
      />
      <Divider my="1.5rem" />
      <Calendar
        formatShortWeekday={(_, date) => date.toString().slice(0, 2)}
        minDate={minDate || new Date()}
        prevLabel={<Icon as={CaretLeft} />}
        nextLabel={<Icon as={CaretRight} />}
        next2Label={null}
        prev2Label={null}
        tileContent={({ date }) =>
          isToday(date) ? (
            <Box
              ml={todayDotLeftMargin}
              bg={selectedDate && isToday(selectedDate) ? 'cosmic-nebula-0' : 'white-1'}
              borderRadius="50%"
              w="4px"
              h="4px"
            />
          ) : null
        }
        onChange={(e: OnDateChangeValue) => {
          if (e instanceof Date) {
            setSelectedDate(e);
            onChange?.(e);
          } else if (Array.isArray(e) && e.length === 2 && e.every(d => d instanceof Date)) {
            setSelectedRange(e);
            onRangeChange?.(e as [Date, Date]);
          }
        }}
        selectRange={isRange}
      />
    </Flex>
  );
}
