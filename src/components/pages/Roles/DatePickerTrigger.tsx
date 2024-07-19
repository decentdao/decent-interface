import { Flex, Icon, Text } from "@chakra-ui/react";
import { CalendarBlank } from "@phosphor-icons/react";
import { format } from "date-fns";
import { t } from "i18next";
import { DEFAULT_DATE_FORMAT } from "../../../utils";

interface DatePickerTriggerProps {
  selectedDate: Date | undefined;
}


export function DatePickerTrigger({ selectedDate }: DatePickerTriggerProps) {
  const selectedDateStr = selectedDate && format(selectedDate, DEFAULT_DATE_FORMAT);
  
    return (
      <Flex
        borderRadius="0.25rem"
        bg="neutral-1"
        borderWidth="1px"
        borderColor="neutral-3"
        padding="0.5rem 1rem"
        alignItems="center"
        gap="0.5rem"
      >
        <Icon
          as={CalendarBlank}
          boxSize="24px"
          color="neutral-5"
        />
        <Text>{selectedDateStr ?? t('select')}</Text>
      </Flex>
    );
  }