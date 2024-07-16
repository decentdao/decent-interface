import { Box, Icon, useBreakpointValue } from '@chakra-ui/react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useState } from 'react';
import { Calendar } from 'react-calendar';

import '../../../assets/css/Calendar.css';
import { CARD_SHADOW, SEXY_BOX_SHADOW_T_T } from '../../../constants/common';

interface DecentDatePickerProps {
  minDate?: Date;
  onChange?: (date: Date) => void;
}

type DateOrNull = Date | null;
type OnDateChangeValue = DateOrNull | [DateOrNull, DateOrNull];

export function DecentDatePicker({ minDate, onChange }: DecentDatePickerProps) {
  const isToday = (someDate: Date) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  const [selectedDate, setSelectedDate] = useState<DateOrNull>();

  const boxShadow = useBreakpointValue({ base: 'none', md: SEXY_BOX_SHADOW_T_T });

  return (
    <Box
      display="flex"
      justifySelf="center"
      borderRadius="0.5rem"
      boxShadow={boxShadow}
    >
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
              ml="1rem"
              bg={selectedDate && isToday(selectedDate) ? 'cosmic-nebula-0' : 'white-1'}
              borderRadius="50%"
              w="4px"
              h="4px"
            />
          ) : null
        }
        onChange={(e: OnDateChangeValue) => {
          console.log(e);
          if (e instanceof Date) {
            setSelectedDate(e);
            onChange?.(e);
          }
        }}
      />
    </Box>
  );
}
