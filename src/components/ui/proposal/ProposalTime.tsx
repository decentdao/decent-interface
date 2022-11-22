import { Flex, Text } from '@chakra-ui/react';
import { Calendar } from '@decent-org/fractal-ui';

import { useTranslation } from 'react-i18next';
import { formatDatesDiffReadable } from '../../../helpers/dateTime';
import Clock from '../svg/Clock';

function ProposalTime({
  deadline,
  icon = 'clock',
}: {
  deadline: number;
  icon?: 'clock' | 'calendar';
}) {
  const { t } = useTranslation('proposal');
  const deadlineDate = new Date(deadline * 1000);
  const now = new Date();

  const diffReadable = formatDatesDiffReadable(deadlineDate, now, t);
  const isPassed = deadlineDate.getMilliseconds() > now.getMilliseconds();
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
        <Text color="sand.700">{t(isPassed ? 'timeAgo' : 'timeLeft', { time: diffReadable })}</Text>
      </Flex>
    </Flex>
  );
}

export default ProposalTime;
