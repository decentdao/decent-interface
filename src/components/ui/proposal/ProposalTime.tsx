import { Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { formatDatesDiffReadable } from '../../../helpers/dateTime';
import Clock from '../svg/Clock';

function ProposalTime({ deadline }: { deadline: number }) {
  const { t } = useTranslation('proposal');
  const deadlineDate = new Date(deadline * 1000);
  const now = new Date();

  const diffReadable = formatDatesDiffReadable(deadlineDate, now, t);
  const isPassed = deadline > now.getMilliseconds();
  return (
    <Flex className="flex">
      <Clock />
      <Flex
        flexWrap="wrap"
        px={2}
        gap={1}
        alignItems="start"
      >
        <Text color="sand.700">{t(isPassed ? 'timeAgo' : 'timeLeft', { time: diffReadable })}</Text>
      </Flex>
    </Flex>
  );
}

export default ProposalTime;
