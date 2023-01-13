import { Flex, Text } from '@chakra-ui/react';
import { Calendar } from '@decent-org/fractal-ui';
import { format } from 'date-fns';

import { useDateTimeDisplay } from '../../../helpers/dateTime';
import { DEFAULT_DATE_FORMAT } from '../../../utils/numberFormats';
import Clock from '../svg/Clock';

type ProposalTimeProps = {
  deadline: number;
  icon?: 'clock' | 'calendar';
  isRejected?: boolean;
  submissionDate?: string;
};

function ProposalTime({ deadline, submissionDate, icon = 'clock', isRejected }: ProposalTimeProps) {
  const deadlineDate = new Date(deadline * 1000);
  const diffReadable = useDateTimeDisplay(deadlineDate);

  return (
    <Flex
      className="flex"
      justifyContent="flex-end"
      alignItems="center"
    >
      {icon === 'clock' ? <Clock fill="sand.700" /> : <Calendar color="sand.700" />}
      <Flex
        px={2}
        gap={1}
      >
        <Text color="sand.700">
          {isRejected ? format(deadlineDate, DEFAULT_DATE_FORMAT) : submissionDate || diffReadable}
        </Text>
      </Flex>
    </Flex>
  );
}

export default ProposalTime;
