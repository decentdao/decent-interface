import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { ArrowRight, Calendar, ClockCountdown, Copy } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, getContract, Hex } from 'viem';
import { useWalletClient } from 'wagmi';
import DecentAutonomousAdminTempAbi from '../../../assets/abi/DecentAutonomousAdminTempAbi';
import { DETAILS_BOX_SHADOW } from '../../../constants/common';
import { useDateTimeDisplay } from '../../../helpers/dateTime';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import { useGetAccountName } from '../../../hooks/utils/useGetAccountName';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../store/roles/useRolesStore';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import Avatar from '../../ui/page/Header/Avatar';
import { RoleFormTermStatus } from './types';

function Container({
  children,
  isTop = false,
  displayLightContainer = false,
}: {
  isTop?: boolean;
  displayLightContainer?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      p="1rem"
      bg="neutral-2"
      boxShadow={displayLightContainer ? 'layeredShadowBorder' : DETAILS_BOX_SHADOW}
      borderTopRadius={isTop ? '0.5rem' : undefined}
      borderBottomRadius={!isTop ? '0.5rem' : undefined}
      display="flex"
      flexDirection="column"
      gap="1rem"
      border={displayLightContainer ? '1px solid' : undefined}
      borderColor={displayLightContainer ? 'neutral-4' : undefined}
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
  const isCurrentTerm = termStatus === RoleFormTermStatus.Current;
  const isNextTerm = termStatus === RoleFormTermStatus.Pending;
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
      revoked: {
        text: t('revoked'),
        textColor: 'red-1',
        iconColor: 'red-1',
      },
    };
    if (isReadyToStart) {
      return statusTextData.readyToStart;
    }
    switch (termStatus) {
      case RoleFormTermStatus.Expired:
        return statusTextData.ended;
      case RoleFormTermStatus.Queued:
        return statusTextData.inQueue;
      case RoleFormTermStatus.Pending:
        return statusTextData.inQueue;
      case RoleFormTermStatus.Current:
        return statusTextData.active;
      default:
        return {
          text: undefined,
          textColor: undefined,
          iconColor: undefined,
        };
    }
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
  displayLightContainer,
}: {
  termNumber: number;
  termEndDate: Date;
  termStatus: RoleFormTermStatus;
  displayLightContainer?: boolean;
}) {
  return (
    <Container
      isTop
      displayLightContainer={displayLightContainer}
    >
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
  const { t } = useTranslation(['roles', 'common']);
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
        <Button
          variant="unstyled"
          p={0}
          h="fit-content"
          aria-label={t('copyAddress', { ns: 'common' })}
          onClick={() => copyToClipboard(memberAddress)}
          rightIcon={
            <Icon
              as={Copy}
              boxSize="1rem"
              color="white-0"
            />
          }
        >
          <Text
            textStyle="label-base"
            color="white-0"
          >
            {accountDisplayName}
          </Text>
        </Button>
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
        <Icon
          as={Calendar}
          boxSize="1.5rem"
        />
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
  hatId,
  termNominatedWearer,
  termEndDate,
  termStatus,
  termNumber,
  displayLightContainer,
}: {
  hatId: Hex;
  termNominatedWearer: Address;
  termEndDate: Date;
  termNumber: number;
  termStatus: RoleFormTermStatus;
  displayLightContainer?: boolean;
}) {
  const { hatsTree, getHat } = useRolesStore();
  const { data: walletClient } = useWalletClient();
  const { t } = useTranslation(['roles']);
  const {
    contracts: { hatsProtocol },
  } = useNetworkConfig();

  const currentHatWearer = useMemo(() => {
    const currentHat = getHat(hatId);
    if (!currentHat) {
      return undefined;
    }
    return currentHat.wearerAddress;
  }, [getHat, hatId]);

  const handleTriggerStartTerm = async () => {
    // @todo check if the wearer address is the Decent Autonomous Admin contract
    // ? @todo if first term wearer === new term nominee, then start term directly?
    const adminHatWearer = hatsTree?.adminHat.wearer;

    if (currentHatWearer === undefined) {
      throw new Error('Current hat must be worn by a member');
    }
    if (adminHatWearer === undefined) {
      throw new Error('Admin hat must be worn by Decent Autonomous Admin');
    }
    if (!walletClient) {
      throw new Error('Public client not found');
    }
    const decentAutonomousAdminContract = getContract({
      abi: DecentAutonomousAdminTempAbi,
      address: adminHatWearer,
      client: walletClient,
    });

    await decentAutonomousAdminContract.write.triggerStartNextTerm([
      {
        currentWearer: currentHatWearer,
        hatsProtocol,
        hatId: BigInt(hatId),
        nominatedWearer: termNominatedWearer,
      },
    ]);
  };
  return (
    <Box>
      <RoleTermHeader
        termNumber={termNumber}
        termEndDate={termEndDate}
        termStatus={termStatus}
        displayLightContainer={displayLightContainer}
      />
      <Container displayLightContainer={displayLightContainer}>
        <Flex justifyContent="space-between">
          <RoleTermMemberAddress memberAddress={currentHatWearer ?? termNominatedWearer} />
          <RoleTermEndDate termEndDate={termEndDate} />
        </Flex>
        {/* {!!currentTerm && currentTerm.termStatus === 'inactive' && ( */}
        <Button
          leftIcon={
            <Icon
              as={ArrowRight}
              size="1.25rem"
            />
          }
          onClick={handleTriggerStartTerm}
        >
          {t('startTerm')}
        </Button>
        {/* )} */}
      </Container>
    </Box>
  );
}
