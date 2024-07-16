import { Box, Icon } from '@chakra-ui/react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

import { Calendar } from 'react-calendar';
import '../../../assets/css/Calendar.css';

interface DecentDatePickerProps {
  minDate?: Date;
}

export function DecentDatePicker({ minDate }: DecentDatePickerProps) {
  const isToday = (someDate: Date) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Box
      display="flex"
      justifySelf="center"
    >
      <Calendar
        formatShortWeekday={(_, date) => date.toString().slice(0, 2)}
        minDate={minDate || new Date()}
        prevLabel={
          <Icon
            as={CaretLeft}
            color="lilac-0"
          />
        }
        nextLabel={
          <Icon
            as={CaretRight}
            color="lilac-0"
          />
        }
        next2Label={null}
        prev2Label={null}
        tileContent={({ date }) =>
          isToday(date) ? (
            <Box
              ml="1rem"
              bg="white-1"
              borderRadius="50%"
              w="4px"
              h="4px"
            />
          ) : null
        }
        onChange={e => {
          console.log(e);
        }}
      />
    </Box>
  );
}
