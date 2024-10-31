import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Calendar, ClockCountdown, Copy } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../../constants/common';
import { useDateTimeDisplay } from '../../../helpers/dateTime';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import { useGetAccountName } from '../../../hooks/utils/useGetAccountName';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import Avatar from '../../ui/page/Header/Avatar';

export type RoleFormTermStatus = 'current' | 'queued' | 'expired' | 'pending';

function Container({ children, isTop = false }: { isTop?: boolean; children: React.ReactNode }) {
  return (
    <Box
      p="1rem"
      bg="neutral-2"
      boxShadow={DETAILS_BOX_SHADOW}
      borderTopRadius={isTop ? '0.5rem' : undefined}
      borderBottomRadius={!isTop ? '0.5rem' : undefined}
      display="flex"
      flexDirection="column"
      gap="1rem"
    >
      {children}
    </Box>
  );
}

function RoleTermHeaderTitle({
  termNumber,
  termStatus,
}: {
  termNumber: number;
  termStatus: RoleFormTermStatus;
}) {
  const { t } = useTranslation(['roles']);
  const isCurrentTerm = termStatus === 'current';
  const isNextTerm = termStatus === 'queued';
  const termIndicatorText = isCurrentTerm
    ? t('currentTerm')
    : isNextTerm
      ? t('nextTerm')
      : undefined;
  return (
    <Flex
      gap={2}
      alignItems="center"
    >
      <Text textStyle="display-lg">{t('termNumber', { number: termNumber })}</Text>
      <Text
        textStyle="label-small"
        color="neutral-5"
      >
        {termIndicatorText}
      </Text>
    </Flex>
  );
}

function RoleTermHeaderStatus({
  termEndDate,
  termStatus,
}: {
  termEndDate: Date;
  termStatus: RoleFormTermStatus;
}) {
  // @todo implement isReadyToStart
  const isReadyToStart = false;
  const { t } = useTranslation(['roles']);
  const dateDisplay = useDateTimeDisplay(termEndDate);

  const statusText = useMemo(() => {
    const statusTextData = {
      ended: {
        text: t('ended'),
        textColor: 'neutral-6',
        iconColor: 'neutral-6',
      },
      inQueue: {
        text: t('inQueue'),
        textColor: 'neutral-7',
        iconColor: 'lilac-0',
      },
      pending: {
        text: t('pending'),
        textColor: 'neutral-7',
        iconColor: 'lilac-0',
      },
      readyToStart: {
        text: t('readyToStart'),
        textColor: 'neutral-7',
        iconColor: 'lilac-0',
      },
      active: {
        text: dateDisplay,
        textColor: 'neutral-7',
        iconColor: 'lilac-0',
      },
      // @todo implement revoked tx
      revoked: {
        text: t('revoked'),
        textColor: 'red-1',
        iconColor: 'red-1',
      },
    };
    if (isReadyToStart) {
      return statusTextData.readyToStart;
    }
    if (termStatus === 'expired') {
      return statusTextData.ended;
    }
    if (termStatus === 'queued') {
      // Next term
      return statusTextData.inQueue;
    }
    if (termStatus === 'pending') {
      // term being created
      return statusTextData.inQueue;
    }
    if (termStatus === 'current') {
      // time left
      return statusTextData.active;
    }

    return {
      text: undefined,
      textColor: undefined,
      iconColor: undefined,
    };
  }, [isReadyToStart, dateDisplay, termStatus, t]);
  return (
    <Flex
      gap={1}
      alignItems="center"
    >
      <Icon
        as={ClockCountdown}
        boxSize="1rem"
        weight="fill"
        color={statusText.iconColor}
      />
      <Text
        textStyle="label-small"
        color={statusText.textColor}
      >
        {statusText.text}
      </Text>
    </Flex>
  );
}

function RoleTermHeader({
  termNumber,
  termEndDate,
  termStatus,
}: {
  termNumber: number;
  termEndDate: Date;
  termStatus: RoleFormTermStatus;
}) {
  return (
    <Container isTop>
      <Flex justifyContent="space-between">
        <RoleTermHeaderTitle
          termNumber={termNumber}
          termStatus={termStatus}
        />
        <RoleTermHeaderStatus
          termEndDate={termEndDate}
          termStatus={termStatus}
        />
      </Flex>
    </Container>
  );
}

function RoleTermMemberAddress({ memberAddress }: { memberAddress: Address }) {
  const { t } = useTranslation(['roles']);
  const { displayName: accountDisplayName } = useGetAccountName(memberAddress);
  const avatarURL = useAvatar(memberAddress);
  const copyToClipboard = useCopyText();
  return (
    <Flex flexDir="column">
      <Text
        textStyle="label-small"
        color="neutral-7"
      >
        {t('member')}
      </Text>
      <Flex
        alignItems="center"
        gap={2}
      >
        <Avatar
          size="icon"
          address={memberAddress}
          url={avatarURL}
        />
        <Flex
          alignItems="center"
          gap={2}
          aria-label="Copy address"
          onClick={() => copyToClipboard(memberAddress)}
        >
          <Text
            textStyle="label-base"
            color="white-0"
          >
            {accountDisplayName}
          </Text>
          <Icon
            as={Copy}
            boxSize="1rem"
            color="white-0"
          />
        </Flex>
      </Flex>
    </Flex>
  );
}

function RoleTermEndDate({ termEndDate }: { termEndDate: Date }) {
  const { t } = useTranslation(['roles']);
  return (
    <Flex flexDir="column">
      <Text
        textStyle="label-small"
        color="neutral-7"
      >
        {t('ending')}
      </Text>
      <Flex
        gap={1}
        alignItems="center"
      >
        <Icon as={Calendar} />
        <Text
          textStyle="label-base"
          color="white"
        >
          {format(termEndDate, DEFAULT_DATE_FORMAT)}
        </Text>
      </Flex>
    </Flex>
  );
}

export default function RoleTerm({
  memberAddress,
  termEndDate,
  termStatus,
  termNumber,
}: {
  memberAddress: Address;
  termEndDate: Date;
  termNumber: number;
  termStatus: RoleFormTermStatus;
}) {
  return (
    <Box>
      <RoleTermHeader
        termNumber={termNumber}
        termEndDate={termEndDate}
        termStatus={termStatus}
      />
      <Container>
        <Flex justifyContent="space-between">
          <RoleTermMemberAddress memberAddress={memberAddress} />
          <RoleTermEndDate termEndDate={termEndDate} />
        </Flex>
      </Container>
    </Box>
  );
}
