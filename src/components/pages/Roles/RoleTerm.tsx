import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Calendar, ClockCountdown, Copy } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../../constants/common';
import { useDateTimeDisplay } from '../../../helpers/dateTime';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import { getChainIdFromPrefix } from '../../../utils/url';
import Avatar from '../../ui/page/Header/Avatar';

export type RoleTermStatus = 'current' | 'queued' | 'expired';

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
  termStatus: RoleTermStatus;
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
  termStatus: RoleTermStatus;
}) {
  const isReadyToStart = false;
  const { t } = useTranslation(['roles']);
  const dateDisplay = useDateTimeDisplay(termEndDate);

  const statusText = useMemo(() => {
    if (isReadyToStart) {
      return t('Ready to start');
    }
    if (termStatus === 'expired') {
      return t('expired');
    }
    if (termStatus === 'queued') {
      // Next term
      return t('inQueue');
    }
    if (termStatus === 'current') {
      // time left
      return dateDisplay;
    }

    return;
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
        color="lilac-0"
      />
      <Text
        textStyle="label-small"
        color="neutral-7"
      >
        {statusText}
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
  termStatus: RoleTermStatus;
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

  const { addressPrefix } = useNetworkConfig();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: memberAddress,
    chainId: getChainIdFromPrefix(addressPrefix),
  });
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
  termStatus: RoleTermStatus;
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
