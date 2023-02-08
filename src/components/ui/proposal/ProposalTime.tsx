import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { format } from 'date-fns';

import { useDateTimeDisplay } from '../../../helpers/dateTime';
import { DEFAULT_DATE_FORMAT } from '../../../utils/numberFormats';
import Clock from '../svg/Clock';
import Execute from '../svg/Execute';
import Lock from '../svg/Lock';
import Vote from '../svg/Vote';

type ProposalTimeProps = {
  deadline: number;
  icon?: 'clock' | 'vote' | 'lock' | 'execute';
  isRejected?: boolean;
  submissionDate?: string;
  tooltipLabel?: string;
};

const ICONS_MAP = {
  clock: Clock,
  vote: Vote,
  lock: Lock,
  execute: Execute,
};

function ProposalTime({
  deadline,
  submissionDate,
  icon = 'clock',
  isRejected,
  tooltipLabel,
}: ProposalTimeProps) {
  const deadlineDate = new Date(deadline * 1000);
  const diffReadable = useDateTimeDisplay(deadlineDate);
  const Icon = ICONS_MAP[icon];

  return (
    <Tooltip
      label={tooltipLabel}
      placement="top"
    >
      <Flex
        className="flex"
        justifyContent="flex-end"
        alignItems="center"
      >
        <Icon />
        <Flex
          px={2}
          gap={1}
        >
          <Text color="chocolate.200">
            {isRejected
              ? format(deadlineDate, DEFAULT_DATE_FORMAT)
              : submissionDate || diffReadable}
          </Text>
        </Flex>
      </Flex>
    </Tooltip>
  );
}

export default ProposalTime;
