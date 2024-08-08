import { Box, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { CaretCircleRight, CaretRight } from '@phosphor-icons/react';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getAddress, zeroAddress } from 'viem';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix } from '../../../utils/url';
import { Card } from '../../ui/cards/Card';
import EtherscanLink from '../../ui/links/EtherscanLink';
import Avatar from '../../ui/page/Header/Avatar';
import EditBadge from './EditBadge';
import { EditBadgeStatus, RoleEditProps, RoleProps, SablierPayment } from './types';

export function AvatarAndRoleName({
  wearerAddress,
  name,
}: {
  wearerAddress: string | undefined;
  name: string;
}) {
  const { addressPrefix } = useNetworkConfig();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: getAddress(wearerAddress || zeroAddress),
    chainId: getChainIdFromPrefix(addressPrefix),
  });
  const avatarURL = useAvatar(wearerAddress || zeroAddress);
  const { t } = useTranslation(['roles']);

  return (
    <Flex alignItems="center">
      {wearerAddress ? (
        <Avatar
          size="xl"
          address={wearerAddress}
          url={avatarURL}
        />
      ) : (
        <Box
          boxSize="3rem"
          borderRadius="100%"
          bg="white-alpha-04"
        />
      )}
      <Flex
        direction="column"
        ml="1rem"
      >
        <Text
          textStyle="display-lg"
          color="white-0"
        >
          {name}
        </Text>
        <Text
          textStyle="button-small"
          color="neutral-7"
        >
          {wearerAddress ? accountDisplayName : t('unassigned')}
        </Text>
      </Flex>
    </Flex>
  );
}

function Payment({ payment }: { payment: SablierPayment | undefined }) {
  const { t } = useTranslation(['roles']);
  const format = ['years', 'days', 'hours'];
  const endDate =
    payment?.scheduleFixedDate?.endDate &&
    formatDuration(
      intervalToDuration({
        start: payment.scheduleFixedDate.startDate,
        end: payment.scheduleFixedDate.endDate,
      }),
      { format },
    );
  const cliffDate =
    payment?.scheduleFixedDate?.cliffDate &&
    formatDuration(
      intervalToDuration({
        start: payment.scheduleFixedDate.startDate,
        end: payment.scheduleFixedDate.cliffDate,
      }),
      { format },
    );
  return (
    <Flex flexDir="column">
      {payment && (
        <Box
          mt="0.25rem"
          ml="4rem"
        >
          <Text
            textStyle="button-small"
            color="neutral-7"
          >
            {t('payment')}
          </Text>
          <Flex
            textStyle="body-base"
            color="white-0"
            gap="0.25rem"
            alignItems="center"
            my="0.5rem"
          >
            <Image
              src={payment.asset.logo}
              fallbackSrc="/images/coin-icon-default.svg"
              alt={payment.asset.symbol}
              w="1.25rem"
              h="1.25rem"
            />
            {payment.amount.value}
            <EtherscanLink
              color="white-0"
              _hover={{ bg: 'transparent' }}
              textStyle="body-base"
              padding={0}
              borderWidth={0}
              value={payment.asset.address}
              type="token"
              wordBreak="break-word"
            >
              {payment.asset.symbol}
            </EtherscanLink>
            <Flex
              flexDir="column"
              gap="0.25rem"
            >
              <Text>{endDate && `${t('after')} ${endDate}`}</Text>
            </Flex>
          </Flex>
          <Text>{cliffDate && `${t('cliff')} ${t('after')} ${cliffDate}`}</Text>
        </Box>
      )}
    </Flex>
  );
}

export function RoleCard({
  name,
  wearerAddress,
  payments,
  editStatus,
  handleRoleClick,
  hatId,
}: RoleProps) {
  return (
    <Card
      mb="1rem"
      onClick={() => handleRoleClick(hatId)}
    >
      <Flex justifyContent="space-between">
        <AvatarAndRoleName
          wearerAddress={wearerAddress}
          name={name}
        />
        <Flex
          alignItems="center"
          gap="1rem"
        >
          <EditBadge editStatus={editStatus} />
          <Icon
            as={CaretRight}
            color="white-0"
          />
        </Flex>
      </Flex>
      {payments &&
        payments.map((payment, index) => (
          <Payment
            key={index}
            payment={payment}
          />
        ))}
    </Card>
  );
}

export function RoleCardEdit({
  name,
  wearerAddress,
  payments,
  editStatus,
  handleRoleClick,
}: RoleEditProps) {
  return (
    <Card
      mb="1rem"
      onClick={handleRoleClick}
    >
      <Flex justifyContent="space-between">
        <AvatarAndRoleName
          wearerAddress={wearerAddress}
          name={name}
        />
        <Flex
          alignItems="center"
          gap="1rem"
        >
          <EditBadge editStatus={editStatus} />
          <Icon
            as={CaretRight}
            color="white-0"
          />
        </Flex>
      </Flex>
      {payments &&
        payments.map((payment, index) => (
          <Payment
            key={index}
            payment={payment}
          />
        ))}
    </Card>
  );
}

export function RoleCardShort({
  name,
  editStatus,
  handleRoleClick,
}: {
  name: string;
  editStatus?: EditBadgeStatus;
  handleRoleClick: () => void;
}) {
  return (
    <Card onClick={handleRoleClick}>
      <Flex justifyContent="space-between">
        <Text
          textStyle="display-lg"
          color="lilac-0"
        >
          {name}
        </Text>
        <Flex
          alignItems="center"
          gap="1rem"
        >
          <EditBadge editStatus={editStatus} />
          <Icon
            as={CaretCircleRight}
            color="white-0"
            boxSize="1.5rem"
          />
        </Flex>
      </Flex>
    </Card>
  );
}
