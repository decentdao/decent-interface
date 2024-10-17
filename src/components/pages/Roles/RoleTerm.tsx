import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { Calendar, ClockCountdown } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../../constants/common';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import { getChainIdFromPrefix } from '../../../utils/url';
import Avatar from '../../ui/page/Header/Avatar';

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

function RoleTermHeaderTitle() {
  const { t } = useTranslation(['roles']);
  const isCurrentTerm = true;
  const termIndicatorText =
    isCurrentTerm === undefined ? undefined : isCurrentTerm ? t('Current Term') : t('Next Term');
  return (
    <Flex
      gap={2}
      alignItems="center"
    >
      <Text textStyle="display-lg">{t('Term 1')}</Text>
      <Text
        textStyle="label-small"
        color="neutral-5"
      >
        {termIndicatorText}
      </Text>
    </Flex>
  );
}

function RoleTermHeaderStatus() {
  const endDateTs = 0n;
  const isCurrentTerm = false;
  const isReadyToStart = false;
  const isQueued = false;

  const statusText = useMemo(() => {
    // is ready to start (show ready to start)
    // is Queued (next term, show In Queue)
    // is Active (show till end date)
    // is Expired (show Expired)
    if (isReadyToStart) {
      return 'Ready to start';
    }
    if (endDateTs < BigInt(Date.now())) {
      return 'Expired';
    }
    if (isQueued) {
      // Next term
      return 'In Queue';
    }
    if (isCurrentTerm) {
      // time left
      return '30 d';
    }

    return;
  }, [endDateTs, isCurrentTerm, isReadyToStart, isQueued]);
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

function RoleTermHeader() {
  return (
    <Container isTop>
      <Flex justifyContent="space-between">
        <RoleTermHeaderTitle />
        <RoleTermHeaderStatus />
      </Flex>
    </Container>
  );
}

function RoleTermMemberAddress() {
  const memberAddress = zeroAddress;
  const { t } = useTranslation(['roles']);

  const { addressPrefix } = useNetworkConfig();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: memberAddress,
    chainId: getChainIdFromPrefix(addressPrefix),
  });
  const avatarURL = useAvatar(memberAddress);
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
        <Text
          textStyle="label-base"
          color="text-white"
        >
          {accountDisplayName}
        </Text>
      </Flex>
    </Flex>
  );
}

function RoleTermEndDate() {
  const endDateTs = Date.now() / 1000;
  return (
    <Flex flexDir="column">
      <Text
        textStyle="label-small"
        color="neutral-7"
      >
        {'Ending'}
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
          {format(new Date(endDateTs * 1000), DEFAULT_DATE_FORMAT)}
        </Text>
      </Flex>
    </Flex>
  );
}

export default function RoleTerm() {
  return (
    <Box>
      <RoleTermHeader />
      <Container>
        <Flex justifyContent="space-between">
          <RoleTermMemberAddress />
          <RoleTermEndDate />
        </Flex>
      </Container>
    </Box>
  );
}
